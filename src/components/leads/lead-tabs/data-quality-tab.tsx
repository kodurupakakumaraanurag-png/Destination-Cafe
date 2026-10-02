"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, XCircle, ShieldCheck, Info } from "lucide-react";
import { LeadDetailRecord } from "@/types/lead-detail";
import { auditLeadDataQuality, MinimalLead } from "@/lib/data-quality";

interface DataQualityTabProps {
  lead: LeadDetailRecord;
}

export function DataQualityTab({ lead }: DataQualityTabProps) {
  const report = React.useMemo(() => {
    return auditLeadDataQuality(lead as unknown as MinimalLead);
  }, [lead]);

  // Exact 26 CRM Intake Fields
  const intakeFields = [
    { key: "company", label: "1. Company", value: lead.company },
    { key: "domain", label: "2. Domain", value: lead.domain },
    { key: "location", label: "3. Location", value: lead.location },
    { key: "website", label: "4. Website", value: lead.website },
    { key: "contactPerson", label: "5. Contact Person", value: lead.contactPerson },
    { key: "designation", label: "6. Designation", value: lead.designation },
    { key: "phone", label: "7. Phone", value: lead.phone },
    { key: "email", label: "8. Email", value: lead.email },
    { key: "businessUnderstanding", label: "9. Business Understanding", value: lead.businessUnderstanding },
    { key: "possibleProblem", label: "10. Possible Problem", value: lead.possibleProblem },
    { key: "requirement", label: "11. Requirement", value: lead.requirement },
    { key: "opportunity", label: "12. Opportunity", value: lead.opportunity },
    { key: "priority", label: "13. Priority", value: lead.priority },
    { key: "status", label: "14. Status", value: lead.status },
    { key: "nextAction", label: "15. Next Action", value: lead.nextAction },
    { key: "dateAdded", label: "16. Date Added", value: lead.dateAdded },
    { key: "source", label: "17. Source", value: lead.source },
    { key: "contactMethod", label: "18. Contact Method", value: lead.contactMethod },
    { key: "digitalPresenceScore", label: "19. Digital Presence Score", value: lead.digitalPresenceScore },
    { key: "hiringActivityScore", label: "20. Hiring Activity Score", value: lead.hiringActivityScore },
    { key: "techStackFitScore", label: "21. Tech Stack Fit Score", value: lead.techStackFitScore },
    { key: "fundingRevenueScore", label: "22. Funding Revenue Score", value: lead.fundingRevenueScore },
    { key: "projectUrgencyScore", label: "23. Project Urgency Score", value: lead.projectUrgencyScore },
    { key: "budgetClarityScore", label: "24. Budget Clarity Score", value: lead.budgetClarityScore },
    { key: "recordedLeadScore", label: "25. Lead Score (Recorded)", value: lead.recordedLeadScore },
    { key: "projectAllocationStatus", label: "26. Project Allocation Status", value: lead.projectAllocationStatus },
  ];

  return (
    <div className="space-y-6">
      {/* Completeness & Quality Summary Banner */}
      <div className="p-5 bg-card border border-border rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-lg text-primary">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              Intake Data Quality &amp; Completeness Audit
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Engine score: <strong>{report.qualityScore}/100</strong> | {report.totalIssuesCount} flagged issues ({report.errorCount} errors, {report.warningCount} warnings)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-black text-primary">{report.completenessPercentage}%</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Completeness</div>
          </div>
          <div className="w-24 bg-muted h-3 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                report.completenessPercentage >= 80
                  ? "bg-emerald-500"
                  : report.completenessPercentage >= 50
                  ? "bg-amber-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${report.completenessPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Flagged Issues List */}
      {report.issues.length > 0 && (
        <Card className="p-4 space-y-3">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Audit Engine Flagged Items ({report.issues.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {report.issues.map((issue, idx) => (
              <div key={idx} className="p-2.5 rounded border border-border bg-muted/20 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground text-[11px]">{issue.message}</span>
                  <Badge
                    variant={issue.severity === "ERROR" ? "destructive" : issue.severity === "WARNING" ? "warning" : "secondary"}
                    className="text-[9px] px-1.5 py-0"
                  >
                    {issue.severity}
                  </Badge>
                </div>
                {issue.field && <span className="text-[10px] text-muted-foreground font-mono">Field: {issue.field}</span>}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Destination Cafe Specific Dossier Note */}
      {report.isDestinationCafe && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg space-y-1.5 text-xs text-amber-800 dark:text-amber-300">
          <p className="font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            Destination Cafe Quality Note:
          </p>
          <p className="leading-relaxed">
            The Destination Cafe intake dossier lacks verified contact information (contactPerson, designation, phone, email). In accordance with platform governance, these fields are explicitly maintained as null/empty rather than filled with dummy placeholders.
          </p>
        </div>
      )}

      {/* 26 Field Audit Grid */}
      <Card>
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            26-Column Field Inventory
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {intakeFields.map((field) => {
              const isFilled = field.value !== null && field.value !== undefined && field.value !== "";
              return (
                <div
                  key={field.key}
                  className={`p-3 rounded-md border text-xs space-y-1 ${
                    isFilled
                      ? "bg-muted/20 border-border"
                      : "bg-amber-50/30 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-900/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground text-[11px] truncate">{field.label}</span>
                    {isFilled ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {isFilled ? String(field.value) : <span className="italic text-amber-600 dark:text-amber-400">Empty / Null</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
