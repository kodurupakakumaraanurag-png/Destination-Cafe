"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  parseAndValidateCSV,
  validateCSVFileSecurity,
  CSVParseResult,
  ParsedCSVRow,
} from "@/lib/csv-parser";
import {
  executeBatchImport,
  getExistingLeadIdentifiers,
  BatchImportResult,
} from "@/lib/actions/import-actions";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Download,
  ArrowRight,
  RefreshCw,
  FileText,
  History,
  Info,
} from "lucide-react";

interface ImportWorkflowProps {
  existingCompanies: string[];
  existingEmails: string[];
}

type WorkflowStep = "UPLOAD" | "PREVIEW" | "IMPORTING" | "SUMMARY";

export function ImportWorkflow({ existingCompanies, existingEmails }: ImportWorkflowProps) {
  const [step, setStep] = React.useState<WorkflowStep>("UPLOAD");
  const [parseResult, setParseResult] = React.useState<CSVParseResult | null>(null);
  const [importSummary, setImportSummary] = React.useState<BatchImportResult | null>(null);
  const [parsing, setParsing] = React.useState(false);
  const [securityError, setSecurityError] = React.useState<string | null>(null);

  const { addToast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (selectedFile: File) => {
    setSecurityError(null);

    // 1. File Security Validation
    const secCheck = validateCSVFileSecurity(selectedFile);
    if (!secCheck.valid) {
      setSecurityError(secCheck.error || "File security check failed");
      addToast(secCheck.error || "Invalid file", "error");
      return;
    }

    setParsing(true);

    try {
      // Fetch fresh existing identifiers for duplicate detection
      const { companies, emails } = await getExistingLeadIdentifiers();
      const text = await selectedFile.text();

      const result = parseAndValidateCSV(
        text,
        selectedFile.name,
        selectedFile.size,
        companies.length > 0 ? companies : existingCompanies,
        emails.length > 0 ? emails : existingEmails
      );

      setParseResult(result);
      setStep("PREVIEW");
      addToast(`Detected ${result.totalRows} records (${result.validCount} valid)`, "info");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to parse CSV file";
      setSecurityError(msg);
      addToast(msg, "error");
    } finally {
      setParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleConfirmImport = async () => {
    if (!parseResult || parseResult.validCount === 0) {
      addToast("No valid records to import.", "error");
      return;
    }

    setStep("IMPORTING");

    try {
      const summaryResult = await executeBatchImport(parseResult);
      setImportSummary(summaryResult);
      setStep("SUMMARY");
      addToast(`Successfully imported ${summaryResult.importedCount} leads!`, "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Batch import execution failed";
      addToast(msg, "error");
      setStep("PREVIEW");
    }
  };

  const handleReset = () => {
    setParseResult(null);
    setImportSummary(null);
    setSecurityError(null);
    setStep("UPLOAD");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Sample 26-Column Template Generator
  const downloadSampleTemplate = () => {
    const headers = [
      "Company",
      "Domain",
      "Location",
      "Website",
      "Contact Person",
      "Designation",
      "Phone",
      "Email",
      "Business Understanding",
      "Possible Problem",
      "Requirement",
      "Opportunity",
      "Priority",
      "Status",
      "Next Action",
      "Date Added",
      "Source",
      "Contact Method",
      "Digital Presence Score",
      "Hiring Activity Score",
      "Tech Stack Fit Score",
      "Funding Revenue Score",
      "Project Urgency Score",
      "Budget Clarity Score",
      "Recorded Lead Score",
      "Project Allocation Status",
    ].join(",");

    const sampleRow = [
      '"Apex Bistro Solutions"',
      '"Restaurant & Hospitality"',
      '"HITEC City, Hyderabad, Telangana"',
      '"https://apexbistro.demo"',
      '"Rohan Verma"',
      '"General Manager"',
      '"+91 98765 00112"',
      '"rohan@apexbistro.demo"',
      '"Active hospitality chain modernizing POS and online ordering CRM."',
      '"Manual order tracking and lack of customer loyalty analytics."',
      '"Custom full-stack web portal and enterprise dashboard."',
      '"High-value long-term maintenance contract potential."',
      '"HIGH"',
      '"NEW"',
      '"Schedule proposal presentation with GM"',
      '"2026-10-01"',
      '"CSV Ingestion"',
      '"Email / Direct"',
      "4",
      "3",
      "4",
      "4",
      "5",
      "4",
      "24",
      '"AVAILABLE_FOR_SELECTION"',
    ].join(",");

    const blob = new Blob([`${headers}\n${sampleRow}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "26_column_lead_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Workflow Progress Stepper Bar */}
      <div className="p-4 bg-card border border-border rounded-xl flex items-center justify-between gap-2 text-xs">
        <div className={`flex items-center gap-2 font-bold ${step === "UPLOAD" ? "text-primary" : "text-muted-foreground"}`}>
          <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px]">1</span>
          <span>Upload File</span>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />

        <div className={`flex items-center gap-2 font-bold ${step === "PREVIEW" || step === "IMPORTING" ? "text-primary" : "text-muted-foreground"}`}>
          <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px]">2</span>
          <span>Preview &amp; Validate</span>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />

        <div className={`flex items-center gap-2 font-bold ${step === "SUMMARY" ? "text-emerald-600" : "text-muted-foreground"}`}>
          <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-[10px]">3</span>
          <span>Import Summary</span>
        </div>
      </div>

      {/* STEP 1: UPLOAD SCREEN */}
      {step === "UPLOAD" && (
        <Card className="p-8">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-primary" />
                  Select CSV File for Import
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Import batch records mapped to the exact 26-column CRM intake dossier schema.
                </p>
              </div>

              <Button variant="outline" size="sm" onClick={downloadSampleTemplate}>
                <Download className="w-3.5 h-3.5 mr-1.5" /> Download 26-Column Template (.csv)
              </Button>
            </div>

            {securityError && (
              <div className="p-3 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 rounded-lg border border-red-200 text-xs flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{securityError}</span>
              </div>
            )}

            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-primary/60 rounded-xl p-10 text-center bg-card hover:bg-muted/20 transition-all cursor-pointer space-y-4"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv,application/csv"
                onChange={handleInputChange}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <FileSpreadsheet className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  Click to select or drag &amp; drop your CSV file here
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports standard <strong>.csv</strong> files up to <strong>5MB</strong>. Sanitizes formula injection safely.
                </p>
              </div>
              <Button type="button" size="sm" variant="outline" loading={parsing}>
                Browse Files
              </Button>
            </div>

            {/* Excel Future Plug Notice */}
            <div className="p-3.5 bg-muted/40 rounded-lg border border-border text-xs text-muted-foreground flex items-center gap-2">
              <Info className="w-4 h-4 text-primary shrink-0" />
              <span>
                <strong>Extensible Architecture:</strong> The ingestion engine uses a decoupled parser interface ready to support Excel (.xlsx / .xls) formats in future releases.
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 2: PREVIEW & VALIDATION SCREEN */}
      {step === "PREVIEW" && parseResult && (
        <div className="space-y-6">
          {/* File Diagnostics Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="p-4 border-l-4 border-l-primary">
              <div className="text-xs font-semibold text-muted-foreground uppercase">Detected Records</div>
              <div className="text-2xl font-bold text-foreground mt-1">{parseResult.totalRows}</div>
              <div className="text-[11px] text-muted-foreground mt-1 truncate">{parseResult.fileName}</div>
            </Card>

            <Card className="p-4 border-l-4 border-l-emerald-500">
              <div className="text-xs font-semibold text-muted-foreground uppercase">Valid for Import</div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{parseResult.validCount}</div>
              <div className="text-[11px] text-muted-foreground mt-1">Ready to create in DB</div>
            </Card>

            <Card className="p-4 border-l-4 border-l-amber-500">
              <div className="text-xs font-semibold text-muted-foreground uppercase">With Warnings</div>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{parseResult.warningCount}</div>
              <div className="text-[11px] text-muted-foreground mt-1">Non-critical notices</div>
            </Card>

            <Card className="p-4 border-l-4 border-l-red-500">
              <div className="text-xs font-semibold text-muted-foreground uppercase">Errors (Rejected)</div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{parseResult.errorCount}</div>
              <div className="text-[11px] text-muted-foreground mt-1">Will be skipped safely</div>
            </Card>

            <Card className="p-4 border-l-4 border-l-indigo-500">
              <div className="text-xs font-semibold text-muted-foreground uppercase">Duplicates</div>
              <div className="text-2xl font-bold text-foreground mt-1">{parseResult.duplicateCount}</div>
              <div className="text-[11px] text-muted-foreground mt-1">Flagged duplicates</div>
            </Card>
          </div>

          {/* Table Preview */}
          <Card>
            <CardHeader className="border-b border-border pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Row-by-Row Validation Preview ({parseResult.rows.length} rows)
              </CardTitle>

              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleConfirmImport}
                  disabled={parseResult.validCount === 0}
                >
                  Confirm &amp; Import ({parseResult.validCount} Valid Records)
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-[450px]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b border-border sticky top-0 font-semibold text-muted-foreground text-[11px]">
                    <tr>
                      <th className="p-3 w-14">Row #</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Company</th>
                      <th className="p-3">Domain</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Calculated Score</th>
                      <th className="p-3">Validation Flags</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {parseResult.rows.map((row: ParsedCSVRow) => (
                      <tr key={row.rowNumber} className={!row.isValid ? "bg-red-50/30 dark:bg-red-950/20" : ""}>
                        <td className="p-3 font-mono font-medium">{row.rowNumber}</td>
                        <td className="p-3">
                          {row.isValid ? (
                            row.warnings.length > 0 ? (
                              <Badge variant="warning" className="text-[10px]">Warning</Badge>
                            ) : (
                              <Badge variant="success" className="text-[10px]">Valid</Badge>
                            )
                          ) : (
                            <Badge variant="destructive" className="text-[10px]">Invalid</Badge>
                          )}
                        </td>
                        <td className="p-3 font-bold text-foreground">{row.cleanedData.company || "—"}</td>
                        <td className="p-3 text-muted-foreground">{row.cleanedData.domain || "—"}</td>
                        <td className="p-3 text-muted-foreground">{row.cleanedData.contactPerson || "null"}</td>
                        <td className="p-3 text-muted-foreground font-mono">{row.cleanedData.email || "null"}</td>
                        <td className="p-3 font-bold text-primary">{row.cleanedData.calculatedLeadScore} / 30</td>
                        <td className="p-3 space-y-1">
                          {row.errors.map((err, i) => (
                            <span key={i} className="text-[10px] text-red-600 dark:text-red-400 block font-medium">
                              • {err}
                            </span>
                          ))}
                          {row.warnings.map((warn, i) => (
                            <span key={i} className="text-[10px] text-amber-600 dark:text-amber-400 block">
                              • {warn}
                            </span>
                          ))}
                          {row.errors.length === 0 && row.warnings.length === 0 && (
                            <span className="text-[10px] text-emerald-600 font-medium">Clean Record</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* STEP 3: IMPORTING PROGRESS */}
      {step === "IMPORTING" && (
        <Card className="p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto animate-spin">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Importing Valid Records...</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Saving leads, creating contacts, generating activities, and writing audit logs to PostgreSQL database.
            </p>
          </div>
        </Card>
      )}

      {/* STEP 4: SUMMARY SCREEN */}
      {step === "SUMMARY" && importSummary && (
        <Card className="p-8 space-y-6">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded-md">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-100">
                  Batch Import Executed Successfully!
                </h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                  Import Batch ID: <span className="font-mono font-bold">{importSummary.batchId}</span>
                </p>
              </div>
            </div>
            <Badge variant="success" className="text-xs px-3 py-1">Batch Status: COMPLETED</Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-lg bg-card border border-border">
              <div className="text-xs text-muted-foreground uppercase font-semibold">Imported Successfully</div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {importSummary.importedCount}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-card border border-border">
              <div className="text-xs text-muted-foreground uppercase font-semibold">Skipped / Rejected</div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                {importSummary.failedCount}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-card border border-border">
              <div className="text-xs text-muted-foreground uppercase font-semibold">Flagged Duplicates</div>
              <div className="text-2xl font-bold text-foreground mt-1">
                {importSummary.duplicateCount}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-card border border-border">
              <div className="text-xs text-muted-foreground uppercase font-semibold">Total File Rows</div>
              <div className="text-2xl font-bold text-foreground mt-1">
                {importSummary.totalRows}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
            <Button variant="outline" size="sm" onClick={handleReset}>
              Import Another File
            </Button>

            <div className="flex items-center gap-3">
              <Link href="/data/import-history">
                <Button variant="outline" size="sm">
                  <History className="w-3.5 h-3.5 mr-1.5" /> View Batch History
                </Button>
              </Link>
              <Link href="/crm/leads">
                <Button size="sm">
                  View Leads Management
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
