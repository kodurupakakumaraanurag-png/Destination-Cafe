/**
 * Data Quality Validation Engine for Destination Cafe CRM
 * Reusable, pure validation functions decoupled from React UI components.
 */

export type QualityIssueSeverity = "ERROR" | "WARNING" | "INFO";

export type QualityIssueCode =
  | "MISSING_POC"
  | "MISSING_DESIGNATION"
  | "MISSING_PHONE"
  | "MISSING_EMAIL"
  | "MISSING_BUSINESS_OVERVIEW"
  | "MISSING_REQUIREMENT"
  | "MISSING_SOURCE"
  | "INVALID_EMAIL"
  | "INVALID_PHONE"
  | "DUPLICATE_COMPANY"
  | "DUPLICATE_EMAIL"
  | "INVALID_SCORE"
  | "SCORE_DISCREPANCY"
  | "INVALID_STATUS";

export interface QualityIssue {
  code: QualityIssueCode;
  severity: QualityIssueSeverity;
  field?: string;
  message: string;
  penalty: number;
}

export interface LeadQualityReport {
  leadId: string;
  company: string;
  domain?: string | null;
  qualityScore: number; // 0 to 100
  completenessPercentage: number; // 0 to 100%
  errorCount: number;
  warningCount: number;
  infoCount: number;
  totalIssuesCount: number;
  issues: QualityIssue[];
  isDestinationCafe: boolean;
  hasScoreDiscrepancy: boolean;
  discrepancyAmount: number;
}

export interface SystemQualitySummary {
  totalLeadsAudited: number;
  averageQualityScore: number;
  averageCompleteness: number;
  totalErrors: number;
  totalWarnings: number;
  totalInfo: number;
  totalIssues: number;
  duplicateCompanyCount: number;
  duplicateEmailCount: number;
  scoreDiscrepancyCount: number;
  leadsNeedingAttention: number;
  destinationCafeReport: LeadQualityReport | null;
  leadReports: LeadQualityReport[];
}

export interface MinimalLead {
  id: string;
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
  priority?: string | null;
  status?: string | null;
  nextAction?: string | null;
  dateAdded?: Date | string | null;
  source?: string | null;
  contactMethod?: string | null;
  digitalPresenceScore?: number | null;
  hiringActivityScore?: number | null;
  techStackFitScore?: number | null;
  fundingRevenueScore?: number | null;
  projectUrgencyScore?: number | null;
  budgetClarityScore?: number | null;
  recordedLeadScore?: number | null;
  calculatedLeadScore?: number | null;
  projectAllocationStatus?: string | null;
  assignedUserId?: string | null;
}

/**
 * Validates email format strictly
 */
export function isValidEmail(email: string): boolean {
  if (!email || !email.trim()) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates phone format (numeric digits, spaces, plus, hyphens, min 6 chars)
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || !phone.trim()) return false;
  const cleaned = phone.replace(/[\s\-+()]/g, "");
  return cleaned.length >= 6 && /^\d+$/.test(cleaned);
}

/**
 * Audits a single lead record for data quality issues
 */
export function auditLeadDataQuality(
  lead: MinimalLead,
  allLeads: MinimalLead[] = []
): LeadQualityReport {
  const issues: QualityIssue[] = [];

  // 1. Missing Contact Person (POC)
  if (!lead.contactPerson || !lead.contactPerson.trim()) {
    issues.push({
      code: "MISSING_POC",
      severity: "WARNING",
      field: "contactPerson",
      message: "Missing primary contact person (POC)",
      penalty: 10,
    });
  }

  // 2. Missing Designation
  if (!lead.designation || !lead.designation.trim()) {
    issues.push({
      code: "MISSING_DESIGNATION",
      severity: "INFO",
      field: "designation",
      message: "Missing contact person designation/role",
      penalty: 5,
    });
  }

  // 3. Missing Phone
  if (!lead.phone || !lead.phone.trim()) {
    issues.push({
      code: "MISSING_PHONE",
      severity: "WARNING",
      field: "phone",
      message: "Missing contact phone number",
      penalty: 10,
    });
  } else if (!isValidPhone(lead.phone)) {
    issues.push({
      code: "INVALID_PHONE",
      severity: "ERROR",
      field: "phone",
      message: `Invalid phone format: "${lead.phone}"`,
      penalty: 15,
    });
  }

  // 4. Missing Email
  if (!lead.email || !lead.email.trim()) {
    issues.push({
      code: "MISSING_EMAIL",
      severity: "WARNING",
      field: "email",
      message: "Missing contact email address",
      penalty: 10,
    });
  } else if (!isValidEmail(lead.email)) {
    issues.push({
      code: "INVALID_EMAIL",
      severity: "ERROR",
      field: "email",
      message: `Invalid email format: "${lead.email}"`,
      penalty: 15,
    });
  }

  // 5. Missing Business Overview
  if (!lead.businessUnderstanding || !lead.businessUnderstanding.trim()) {
    issues.push({
      code: "MISSING_BUSINESS_OVERVIEW",
      severity: "WARNING",
      field: "businessUnderstanding",
      message: "Missing business understanding overview",
      penalty: 10,
    });
  }

  // 6. Missing Requirement
  if (!lead.requirement || !lead.requirement.trim()) {
    issues.push({
      code: "MISSING_REQUIREMENT",
      severity: "WARNING",
      field: "requirement",
      message: "Missing project requirement details",
      penalty: 10,
    });
  }

  // 7. Missing Source
  if (!lead.source || !lead.source.trim()) {
    issues.push({
      code: "MISSING_SOURCE",
      severity: "INFO",
      field: "source",
      message: "Missing lead origin source",
      penalty: 5,
    });
  }

  // 8. Invalid Score Dimensions (0-5 range check)
  const scores = [
    { name: "digitalPresenceScore", val: lead.digitalPresenceScore },
    { name: "hiringActivityScore", val: lead.hiringActivityScore },
    { name: "techStackFitScore", val: lead.techStackFitScore },
    { name: "fundingRevenueScore", val: lead.fundingRevenueScore },
    { name: "projectUrgencyScore", val: lead.projectUrgencyScore },
    { name: "budgetClarityScore", val: lead.budgetClarityScore },
  ];

  for (const s of scores) {
    if (s.val !== null && s.val !== undefined && (s.val < 0 || s.val > 5)) {
      issues.push({
        code: "INVALID_SCORE",
        severity: "ERROR",
        field: s.name,
        message: `Dimensional score "${s.name}" is out of valid 0–5 range (${s.val})`,
        penalty: 15,
      });
    }
  }

  if (
    lead.recordedLeadScore !== null &&
    lead.recordedLeadScore !== undefined &&
    (lead.recordedLeadScore < 0 || lead.recordedLeadScore > 30)
  ) {
    issues.push({
      code: "INVALID_SCORE",
      severity: "ERROR",
      field: "recordedLeadScore",
      message: `Recorded lead score is out of 0–30 range (${lead.recordedLeadScore})`,
      penalty: 15,
    });
  }

  // 9. Score Discrepancy Detection
  const calculatedScore =
    (lead.digitalPresenceScore || 0) +
    (lead.hiringActivityScore || 0) +
    (lead.techStackFitScore || 0) +
    (lead.fundingRevenueScore || 0) +
    (lead.projectUrgencyScore || 0) +
    (lead.budgetClarityScore || 0);

  const effectiveCalculated = lead.calculatedLeadScore ?? calculatedScore;
  const recordedScore = lead.recordedLeadScore;
  const hasScoreDiscrepancy =
    recordedScore !== null &&
    recordedScore !== undefined &&
    recordedScore !== effectiveCalculated;

  const discrepancyAmount = hasScoreDiscrepancy ? Math.abs(recordedScore - effectiveCalculated) : 0;

  if (hasScoreDiscrepancy) {
    issues.push({
      code: "SCORE_DISCREPANCY",
      severity: "WARNING",
      field: "recordedLeadScore",
      message: `Recorded score (${recordedScore}/30) differs from calculated score (${effectiveCalculated}/30) by ${discrepancyAmount} points`,
      penalty: 15,
    });
  }

  // 10. Invalid Status Check
  const validStatuses = [
    "NEW",
    "CONTACTED",
    "QUALIFIED",
    "PROPOSAL",
    "NEGOTIATION",
    "WON",
    "LOST",
    "IN_PROGRESS",
    "UNQUALIFIED",
    "CONVERTED",
    "ARCHIVED",
  ];
  if (lead.status && !validStatuses.includes(lead.status)) {
    issues.push({
      code: "INVALID_STATUS",
      severity: "ERROR",
      field: "status",
      message: `Unrecognized lead status: "${lead.status}"`,
      penalty: 15,
    });
  }

  // 11 & 12. Duplicate Company & Duplicate Email Detection across dataset
  if (allLeads.length > 0) {
    const normCompany = lead.company.trim().toLowerCase();
    const companyDupes = allLeads.filter(
      (other) => other.id !== lead.id && other.company.trim().toLowerCase() === normCompany
    );
    if (companyDupes.length > 0) {
      issues.push({
        code: "DUPLICATE_COMPANY",
        severity: "ERROR",
        field: "company",
        message: `Duplicate company name found in dataset (${companyDupes.length} other record)`,
        penalty: 15,
      });
    }

    if (lead.email && lead.email.trim()) {
      const normEmail = lead.email.trim().toLowerCase();
      const emailDupes = allLeads.filter(
        (other) => other.id !== lead.id && other.email && other.email.trim().toLowerCase() === normEmail
      );
      if (emailDupes.length > 0) {
        issues.push({
          code: "DUPLICATE_EMAIL",
          severity: "ERROR",
          field: "email",
          message: `Duplicate email address found in dataset (${emailDupes.length} other record)`,
          penalty: 15,
        });
      }
    }
  }

  // Calculate Completeness Percentage (out of 26 exact intake schema fields)
  const schemaFields = [
    lead.company,
    lead.domain,
    lead.location,
    lead.website,
    lead.contactPerson,
    lead.designation,
    lead.phone,
    lead.email,
    lead.businessUnderstanding,
    lead.possibleProblem,
    lead.requirement,
    lead.opportunity,
    lead.priority,
    lead.status,
    lead.nextAction,
    lead.dateAdded,
    lead.source,
    lead.contactMethod,
    lead.digitalPresenceScore,
    lead.hiringActivityScore,
    lead.techStackFitScore,
    lead.fundingRevenueScore,
    lead.projectUrgencyScore,
    lead.budgetClarityScore,
    lead.recordedLeadScore,
    lead.projectAllocationStatus,
  ];

  const populatedCount = schemaFields.filter(
    (val) => val !== null && val !== undefined && val !== ""
  ).length;
  const completenessPercentage = Math.round((populatedCount / 26) * 100);

  // Calculate Overall Quality Score (100 minus sum of issue penalties, min 0)
  const totalPenalties = issues.reduce((sum, issue) => sum + issue.penalty, 0);
  const qualityScore = Math.max(0, 100 - totalPenalties);

  const errorCount = issues.filter((i) => i.severity === "ERROR").length;
  const warningCount = issues.filter((i) => i.severity === "WARNING").length;
  const infoCount = issues.filter((i) => i.severity === "INFO").length;

  return {
    leadId: lead.id,
    company: lead.company,
    domain: lead.domain,
    qualityScore,
    completenessPercentage,
    errorCount,
    warningCount,
    infoCount,
    totalIssuesCount: issues.length,
    issues,
    isDestinationCafe: lead.company === "Destination Cafe",
    hasScoreDiscrepancy,
    discrepancyAmount,
  };
}

/**
 * Audits system-wide dataset quality across all lead records
 */
export function auditSystemDataQuality(leads: MinimalLead[]): SystemQualitySummary {
  if (!leads || leads.length === 0) {
    return {
      totalLeadsAudited: 0,
      averageQualityScore: 100,
      averageCompleteness: 100,
      totalErrors: 0,
      totalWarnings: 0,
      totalInfo: 0,
      totalIssues: 0,
      duplicateCompanyCount: 0,
      duplicateEmailCount: 0,
      scoreDiscrepancyCount: 0,
      leadsNeedingAttention: 0,
      destinationCafeReport: null,
      leadReports: [],
    };
  }

  const reports = leads.map((lead) => auditLeadDataQuality(lead, leads));

  const totalLeads = reports.length;
  const avgQualityScore = Math.round(
    reports.reduce((acc, r) => acc + r.qualityScore, 0) / totalLeads
  );
  const avgCompleteness = Math.round(
    reports.reduce((acc, r) => acc + r.completenessPercentage, 0) / totalLeads
  );

  const totalErrors = reports.reduce((acc, r) => acc + r.errorCount, 0);
  const totalWarnings = reports.reduce((acc, r) => acc + r.warningCount, 0);
  const totalInfo = reports.reduce((acc, r) => acc + r.infoCount, 0);
  const totalIssues = reports.reduce((acc, r) => acc + r.totalIssuesCount, 0);

  const scoreDiscrepancyCount = reports.filter((r) => r.hasScoreDiscrepancy).length;

  const duplicateCompanyCount = reports.filter((r) =>
    r.issues.some((i) => i.code === "DUPLICATE_COMPANY")
  ).length;

  const duplicateEmailCount = reports.filter((r) =>
    r.issues.some((i) => i.code === "DUPLICATE_EMAIL")
  ).length;

  const leadsNeedingAttention = reports.filter(
    (r) => r.qualityScore < 75 || r.errorCount > 0
  ).length;

  const destinationCafeReport =
    reports.find((r) => r.isDestinationCafe) || null;

  return {
    totalLeadsAudited: totalLeads,
    averageQualityScore: avgQualityScore,
    averageCompleteness: avgCompleteness,
    totalErrors,
    totalWarnings,
    totalInfo,
    totalIssues,
    duplicateCompanyCount,
    duplicateEmailCount,
    scoreDiscrepancyCount,
    leadsNeedingAttention,
    destinationCafeReport,
    leadReports: reports,
  };
}
