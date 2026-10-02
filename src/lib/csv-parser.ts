import { LeadStatus, Priority, ProjectAllocationStatus } from "@prisma/client";
import { isValidEmail, isValidPhone } from "@/lib/data-quality";

export interface ParsedCSVRow {
  rowNumber: number;
  rawData: Record<string, string>;
  cleanedData: {
    company: string;
    domain?: string | null;
    location?: string | null;
    website?: string | null;
    contactPerson?: string | null;
    designation?: string | null;
    phone?: string | null;
    email?: string | null;
    businessUnderstanding?: string | null;
    possibleProblem?: string | null;
    requirement?: string | null;
    opportunity?: string | null;
    priority: Priority;
    status: LeadStatus;
    nextAction?: string | null;
    dateAdded?: string | null;
    source?: string | null;
    contactMethod?: string | null;
    digitalPresenceScore: number;
    hiringActivityScore: number;
    techStackFitScore: number;
    fundingRevenueScore: number;
    projectUrgencyScore: number;
    budgetClarityScore: number;
    recordedLeadScore?: number | null;
    calculatedLeadScore: number;
    projectAllocationStatus: ProjectAllocationStatus;
  };
  isValid: boolean;
  errors: string[];
  warnings: string[];
  isDuplicate: boolean;
}

export interface CSVParseResult {
  fileName: string;
  fileSize: number;
  totalRows: number;
  validCount: number;
  warningCount: number;
  errorCount: number;
  duplicateCount: number;
  rows: ParsedCSVRow[];
}

/**
 * Sanitizes cell text to prevent CSV formula injection (e.g. =CMD, +SUM, -1, @EXEC)
 */
export function sanitizeCellValue(val: string | undefined | null): string {
  if (!val) return "";
  let clean = String(val).trim();
  // Strip formula triggers at start of string
  if (clean.startsWith("=") || clean.startsWith("+") || clean.startsWith("-") || clean.startsWith("@")) {
    clean = clean.replace(/^[=+\-@]+/, "");
  }
  return clean;
}

/**
 * Normalizes CSV header text to standard CRM 26 intake schema field keys
 */
export function normalizeHeader(header: string): string {
  const clean = header.trim().toLowerCase().replace(/[^a-z0-9]/g, "");

  if (clean.includes("company")) return "company";
  if (clean.includes("domain") || clean.includes("sector") || clean.includes("industry")) return "domain";
  if (clean.includes("location") || clean.includes("address") || clean.includes("city")) return "location";
  if (clean.includes("website") || clean.includes("url")) return "website";
  if (clean.includes("contactperson") || clean.includes("contactname") || clean.includes("poc")) return "contactPerson";
  if (clean.includes("designation") || clean.includes("title") || clean.includes("role")) return "designation";
  if (clean.includes("phone") || clean.includes("mobile") || clean.includes("tel")) return "phone";
  if (clean.includes("email") || clean.includes("mail")) return "email";
  if (clean.includes("businessunderstanding") || clean.includes("business")) return "businessUnderstanding";
  if (clean.includes("possibleproblem") || clean.includes("problem") || clean.includes("painpoint")) return "possibleProblem";
  if (clean.includes("requirement") || clean.includes("req")) return "requirement";
  if (clean.includes("opportunity")) return "opportunity";
  if (clean.includes("priority")) return "priority";
  if (clean.includes("status")) return "status";
  if (clean.includes("nextaction") || clean.includes("nextfollowup")) return "nextAction";
  if (clean.includes("dateadded") || clean.includes("date")) return "dateAdded";
  if (clean.includes("source") || clean.includes("origin")) return "source";
  if (clean.includes("contactmethod") || clean.includes("method")) return "contactMethod";
  if (clean.includes("digitalpresence") || clean.includes("digitalscore")) return "digitalPresenceScore";
  if (clean.includes("hiringactivity") || clean.includes("hiringscore")) return "hiringActivityScore";
  if (clean.includes("techstack") || clean.includes("techscore")) return "techStackFitScore";
  if (clean.includes("fundingrevenue") || clean.includes("fundingscore")) return "fundingRevenueScore";
  if (clean.includes("projecturgency") || clean.includes("urgencyscore")) return "projectUrgencyScore";
  if (clean.includes("budgetclarity") || clean.includes("budgetscore")) return "budgetClarityScore";
  if (clean.includes("recordedleadscore") || clean.includes("recordedscore") || clean.includes("leadscore")) return "recordedLeadScore";
  if (clean.includes("projectallocation") || clean.includes("allocation")) return "projectAllocationStatus";

  return header.trim();
}

/**
 * Robust CSV string parser handling quotes, commas, and multi-line values
 */
export function parseCSVText(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      currentRow.push(currentCell);
      currentCell = "";
    } else if ((char === "\r" || char === "\n") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i++;
      }
      currentRow.push(currentCell);
      if (currentRow.some((cell) => cell.trim().length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = "";
    } else {
      currentCell += char;
    }
  }

  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell);
    if (currentRow.some((cell) => cell.trim().length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Validates security constraints on the uploaded CSV File
 */
export function validateCSVFileSecurity(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit
  const isCSVExtension = file.name.toLowerCase().endsWith(".csv");

  if (!isCSVExtension) {
    return {
      valid: false,
      error: `Invalid file extension "${file.name}". Only .csv files are supported for import.`,
    };
  }

  if (file.size > MAX_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds the 5MB maximum limit (${(file.size / (1024 * 1024)).toFixed(2)}MB uploaded).`,
    };
  }

  return { valid: true };
}

/**
 * Parses and validates CSV content against 26-column schema and existing database records
 */
export function parseAndValidateCSV(
  csvText: string,
  fileName: string,
  fileSize: number,
  existingCompanies: string[] = [],
  existingEmails: string[] = []
): CSVParseResult {
  const matrix = parseCSVText(csvText);
  if (matrix.length === 0) {
    return {
      fileName,
      fileSize,
      totalRows: 0,
      validCount: 0,
      warningCount: 0,
      errorCount: 0,
      duplicateCount: 0,
      rows: [],
    };
  }

  // Row 0: Headers
  const rawHeaders = matrix[0];
  const normalizedHeaders = rawHeaders.map(normalizeHeader);

  const parsedRows: ParsedCSVRow[] = [];
  const seenCompaniesInFile = new Set<string>();
  const seenEmailsInFile = new Set<string>();

  const lowerExistingCompanies = new Set(existingCompanies.map((c) => c.toLowerCase()));
  const lowerExistingEmails = new Set(existingEmails.map((e) => e.toLowerCase()));

  for (let r = 1; r < matrix.length; r++) {
    const rowData = matrix[r];
    const rawDataRecord: Record<string, string> = {};

    normalizedHeaders.forEach((headerKey, idx) => {
      rawDataRecord[headerKey] = sanitizeCellValue(rowData[idx]);
    });

    const errors: string[] = [];
    const warnings: string[] = [];

    // Extract Company (Mandatory)
    const company = rawDataRecord["company"] || "";
    if (!company) {
      errors.push("Row error: Company Name is required.");
    }

    // Extract Email & Phone
    const email = rawDataRecord["email"] || null;
    if (email && !isValidEmail(email)) {
      warnings.push(`Warning: Invalid email format "${email}".`);
    }

    const phone = rawDataRecord["phone"] || null;
    if (phone && !isValidPhone(phone)) {
      warnings.push(`Warning: Invalid phone number format "${phone}".`);
    }

    // Extract Priority
    let priority: Priority = Priority.MEDIUM;
    const rawPriority = (rawDataRecord["priority"] || "").toUpperCase();
    if (rawPriority === "LOW") priority = Priority.LOW;
    else if (rawPriority === "HIGH") priority = Priority.HIGH;
    else if (rawPriority === "URGENT") priority = Priority.URGENT;

    // Extract Lead Status
    let status: LeadStatus = LeadStatus.NEW;
    const rawStatus = (rawDataRecord["status"] || "").toUpperCase().replace(/\s+/g, "_");
    if (Object.values(LeadStatus).includes(rawStatus as LeadStatus)) {
      status = rawStatus as LeadStatus;
    }

    // Extract 6 Score Dimensions (0-5)
    const parseScore = (key: string, name: string): number => {
      const val = parseInt(rawDataRecord[key] || "0", 10);
      if (isNaN(val) || val < 0) return 0;
      if (val > 5) {
        warnings.push(`Warning: ${name} value ${val} capped to 5.`);
        return 5;
      }
      return val;
    };

    const digitalPresenceScore = parseScore("digitalPresenceScore", "Digital Presence Score");
    const hiringActivityScore = parseScore("hiringActivityScore", "Hiring Activity Score");
    const techStackFitScore = parseScore("techStackFitScore", "Tech Stack Fit Score");
    const fundingRevenueScore = parseScore("fundingRevenueScore", "Funding Revenue Score");
    const projectUrgencyScore = parseScore("projectUrgencyScore", "Project Urgency Score");
    const budgetClarityScore = parseScore("budgetClarityScore", "Budget Clarity Score");

    const calculatedLeadScore =
      digitalPresenceScore +
      hiringActivityScore +
      techStackFitScore +
      fundingRevenueScore +
      projectUrgencyScore +
      budgetClarityScore;

    // Extract Recorded Lead Score (0-30)
    let recordedLeadScore: number | null = null;
    if (rawDataRecord["recordedLeadScore"]) {
      const recVal = parseInt(rawDataRecord["recordedLeadScore"], 10);
      if (!isNaN(recVal)) {
        recordedLeadScore = Math.max(0, Math.min(30, recVal));
        if (recordedLeadScore !== calculatedLeadScore) {
          warnings.push(`Intake Discrepancy: Recorded score (${recordedLeadScore}) differs from calculated score (${calculatedLeadScore}).`);
        }
      }
    }

    // Check Duplicate Status
    let isDuplicate = false;
    if (company) {
      const normComp = company.toLowerCase();
      if (lowerExistingCompanies.has(normComp) || seenCompaniesInFile.has(normComp)) {
        isDuplicate = true;
        warnings.push(`Duplicate: Company "${company}" already exists in database or file.`);
      } else {
        seenCompaniesInFile.add(normComp);
      }
    }

    if (email) {
      const normMail = email.toLowerCase();
      if (lowerExistingEmails.has(normMail) || seenEmailsInFile.has(normMail)) {
        warnings.push(`Duplicate: Email "${email}" already registered in database or file.`);
      } else {
        seenEmailsInFile.add(normMail);
      }
    }

    // Allocation Status
    let projectAllocationStatus: ProjectAllocationStatus = ProjectAllocationStatus.AVAILABLE_FOR_SELECTION;
    const rawAlloc = (rawDataRecord["projectAllocationStatus"] || "").toUpperCase().replace(/\s+/g, "_");
    if (Object.values(ProjectAllocationStatus).includes(rawAlloc as ProjectAllocationStatus)) {
      projectAllocationStatus = rawAlloc as ProjectAllocationStatus;
    }

    const isValid = errors.length === 0;

    parsedRows.push({
      rowNumber: r + 1, // 1-indexed (row 1 = headers)
      rawData: rawDataRecord,
      cleanedData: {
        company,
        domain: rawDataRecord["domain"] || null,
        location: rawDataRecord["location"] || null,
        website: rawDataRecord["website"] || null,
        contactPerson: rawDataRecord["contactPerson"] || null,
        designation: rawDataRecord["designation"] || null,
        phone,
        email,
        businessUnderstanding: rawDataRecord["businessUnderstanding"] || null,
        possibleProblem: rawDataRecord["possibleProblem"] || null,
        requirement: rawDataRecord["requirement"] || null,
        opportunity: rawDataRecord["opportunity"] || null,
        priority,
        status,
        nextAction: rawDataRecord["nextAction"] || null,
        dateAdded: rawDataRecord["dateAdded"] || new Date().toISOString().split("T")[0],
        source: rawDataRecord["source"] || "CSV Batch Import",
        contactMethod: rawDataRecord["contactMethod"] || null,
        digitalPresenceScore,
        hiringActivityScore,
        techStackFitScore,
        fundingRevenueScore,
        projectUrgencyScore,
        budgetClarityScore,
        recordedLeadScore,
        calculatedLeadScore,
        projectAllocationStatus,
      },
      isValid,
      errors,
      warnings,
      isDuplicate,
    });
  }

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const warningCount = parsedRows.filter((r) => r.warnings.length > 0).length;
  const errorCount = parsedRows.filter((r) => !r.isValid).length;
  const duplicateCount = parsedRows.filter((r) => r.isDuplicate).length;

  return {
    fileName,
    fileSize,
    totalRows: parsedRows.length,
    validCount,
    warningCount,
    errorCount,
    duplicateCount,
    rows: parsedRows,
  };
}
