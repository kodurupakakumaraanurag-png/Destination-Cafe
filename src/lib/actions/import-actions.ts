"use server";

import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/server-auth";
import { CSVParseResult } from "@/lib/csv-parser";
import { revalidatePath } from "next/cache";

export type BatchImportResult = {
  batchId: string;
  fileName: string;
  totalRows: number;
  importedCount: number;
  failedCount: number;
  duplicateCount: number;
  warningCount: number;
};

export type ImportBatchWithErrors = {
  id: string;
  fileName: string;
  totalRows: number;
  successRows: number;
  failedRows: number;
  status: string;
  createdAt: Date;
  errors: Array<{
    id: string;
    rowNumber: number;
    fieldName: string | null;
    errorMessage: string;
    rawData: string | null;
  }>;
};

export async function executeBatchImport(parseResult: CSVParseResult): Promise<BatchImportResult> {
  const session = await requirePermission("IMPORT_DATA");

  const validRows = parseResult.rows.filter((r) => r.isValid);
  const failedRows = parseResult.rows.filter((r) => !r.isValid);

  // 1. Create ImportBatch DB Record
  const importBatch = await prisma.importBatch.create({
    data: {
      fileName: parseResult.fileName,
      totalRows: parseResult.totalRows,
      successRows: validRows.length,
      failedRows: failedRows.length,
      status: "COMPLETED",
    },
  });

  // 2. Create ImportError DB Records for Invalid Rows
  for (const failedRow of failedRows) {
    await prisma.importError.create({
      data: {
        importBatchId: importBatch.id,
        rowNumber: failedRow.rowNumber,
        fieldName: "company",
        errorMessage: failedRow.errors.join("; ") || "Row validation failed",
        rawData: JSON.stringify(failedRow.rawData),
      },
    });
  }

  // 3. Create Lead Records for Valid Rows
  let importedCount = 0;
  for (const validRow of validRows) {
    const d = validRow.cleanedData;
    try {
      await prisma.lead.create({
        data: {
          company: d.company,
          domain: d.domain || null,
          location: d.location || null,
          website: d.website || null,
          contactPerson: d.contactPerson || null,
          designation: d.designation || null,
          phone: d.phone || null,
          email: d.email || null,
          businessUnderstanding: d.businessUnderstanding || null,
          possibleProblem: d.possibleProblem || null,
          requirement: d.requirement || null,
          opportunity: d.opportunity || null,
          priority: d.priority,
          status: d.status,
          nextAction: d.nextAction || null,
          dateAdded: d.dateAdded ? new Date(d.dateAdded) : new Date(),
          source: d.source || "CSV Batch Import",
          contactMethod: d.contactMethod || null,
          digitalPresenceScore: d.digitalPresenceScore,
          hiringActivityScore: d.hiringActivityScore,
          techStackFitScore: d.techStackFitScore,
          fundingRevenueScore: d.fundingRevenueScore,
          projectUrgencyScore: d.projectUrgencyScore,
          budgetClarityScore: d.budgetClarityScore,
          recordedLeadScore: d.recordedLeadScore ?? null,
          calculatedLeadScore: d.calculatedLeadScore,
          projectAllocationStatus: d.projectAllocationStatus,
          importBatchId: importBatch.id,
          contacts: d.contactPerson
            ? {
                create: {
                  name: d.contactPerson,
                  designation: d.designation || null,
                  phone: d.phone || null,
                  email: d.email || null,
                  isPrimary: true,
                },
              }
            : undefined,
          activities: {
            create: {
              userId: session.user.id,
              type: "SYSTEM_EVENT",
              title: "Imported via CSV Batch",
              description: `Batch import from file "${parseResult.fileName}" (Batch ID: ${importBatch.id}).`,
            },
          },
        },
      });
      importedCount++;
    } catch (err: unknown) {
      console.error(`Failed to import row ${validRow.rowNumber} for ${d.company}:`, err);
      // Log DB insertion error as ImportError
      await prisma.importError.create({
        data: {
          importBatchId: importBatch.id,
          rowNumber: validRow.rowNumber,
          fieldName: "database",
          errorMessage: err instanceof Error ? err.message : "Database insertion failed",
          rawData: JSON.stringify(validRow.rawData),
        },
      });
    }
  }

  // 4. Create Immutable Audit Log
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "IMPORT_CSV_BATCH",
      entity: "ImportBatch",
      entityId: importBatch.id,
      details: `Imported ${importedCount} leads from CSV file "${parseResult.fileName}" (${failedRows.length} rejected).`,
    },
  });

  revalidatePath("/imports");
  revalidatePath("/data/import");
  revalidatePath("/data/import-history");
  revalidatePath("/crm/leads");
  revalidatePath("/pipeline");

  return {
    batchId: importBatch.id,
    fileName: parseResult.fileName,
    totalRows: parseResult.totalRows,
    importedCount,
    failedCount: failedRows.length,
    duplicateCount: parseResult.duplicateCount,
    warningCount: parseResult.warningCount,
  };
}

export async function getExistingLeadIdentifiers() {
  await requirePermission("IMPORT_DATA");

  const leads = await prisma.lead.findMany({
    select: { company: true, email: true },
  });

  return {
    companies: leads.map((l) => l.company),
    emails: leads.map((l) => l.email).filter(Boolean) as string[],
  };
}

export async function getImportBatches() {
  await requirePermission("IMPORT_DATA");

  try {
    const batches = await prisma.importBatch.findMany({
      include: {
        errors: { orderBy: { rowNumber: "asc" } },
        _count: { select: { leads: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return batches;
  } catch (error: unknown) {
    console.error("Error fetching import batches:", error);
    return [];
  }
}
