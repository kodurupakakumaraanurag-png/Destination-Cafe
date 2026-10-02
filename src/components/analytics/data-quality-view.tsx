"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { SystemQualitySummary, QualityIssue } from "@/lib/data-quality";
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Info,
  Building2,
  Search,
  Award,
  Users,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileCheck,
} from "lucide-react";

interface DataQualityViewProps {
  summary: SystemQualitySummary;
}

export function DataQualityView({ summary }: DataQualityViewProps) {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [expandedLeadId, setExpandedLeadId] = React.useState<string | null>(null);

  const toggleExpand = (leadId: string) => {
    setExpandedLeadId((prev) => (prev === leadId ? null : leadId));
  };

  const filteredReports = React.useMemo(() => {
    return summary.leadReports.filter((report) => {
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesCompany = report.company.toLowerCase().includes(query);
        const matchesDomain = report.domain?.toLowerCase().includes(query) || false;
        if (!matchesCompany && !matchesDomain) return false;
      }

      if (statusFilter === "CRITICAL" && report.qualityScore >= 75) {
        return false;
      }
      if (statusFilter === "HEALTHY" && report.qualityScore < 75) {
        return false;
      }
      if (statusFilter === "DISCREPANCY" && !report.hasScoreDiscrepancy) {
        return false;
      }
      if (statusFilter === "ERRORS" && report.errorCount === 0) {
        return false;
      }

      return true;
    });
  }, [summary.leadReports, search, statusFilter]);

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 85) return "success";
    if (score >= 70) return "warning";
    return "destructive";
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "ERROR":
        return <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Error</Badge>;
      case "WARNING":
        return <Badge variant="warning" className="text-[9px] px-1.5 py-0">Warning</Badge>;
      default:
        return <Badge variant="secondary" className="text-[9px] px-1.5 py-0">Info</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4 border-l-4 border-l-primary">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">System Quality Score</span>
              <div className="text-2xl font-extrabold text-foreground mt-1">
                {summary.averageQualityScore} <span className="text-xs font-normal text-muted-foreground">/ 100</span>
              </div>
            </div>
            <div className="p-2 bg-primary/10 rounded-md text-primary">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[11px] text-muted-foreground mt-2">
            Average across {summary.totalLeadsAudited} audited leads
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider font-mono">Completeness</span>
              <div className="text-2xl font-extrabold text-foreground mt-1">
                {summary.averageCompleteness}%
              </div>
            </div>
            <div className="p-2 bg-emerald-500/10 rounded-md text-emerald-600 dark:text-emerald-400">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[11px] text-muted-foreground mt-2">
            Average schema field population
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-red-500">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Critical Errors</span>
              <div className="text-2xl font-extrabold text-red-600 dark:text-red-400 mt-1">
                {summary.totalErrors}
              </div>
            </div>
            <div className="p-2 bg-red-500/10 rounded-md text-red-600 dark:text-red-400">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[11px] text-muted-foreground mt-2">
            Formatting &amp; duplicate issues
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Score Discrepancies</span>
              <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                {summary.scoreDiscrepancyCount}
              </div>
            </div>
            <div className="p-2 bg-amber-500/10 rounded-md text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[11px] text-muted-foreground mt-2">
            Recorded vs Calculated score mismatches
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-indigo-500">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Audit Issues</span>
              <div className="text-2xl font-extrabold text-foreground mt-1">
                {summary.totalIssues}
              </div>
            </div>
            <div className="p-2 bg-indigo-500/10 rounded-md text-indigo-600 dark:text-indigo-400">
              <Info className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[11px] text-muted-foreground mt-2">
            {summary.totalWarnings} warnings, {summary.totalInfo} info notices
          </div>
        </Card>
      </div>

      {/* Destination Cafe Spotlight Card */}
      {summary.destinationCafeReport && (
        <Card className="border-2 border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-amber-200 dark:border-amber-800/60 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 rounded-lg">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-amber-950 dark:text-amber-100 flex items-center gap-2">
                  Destination Cafe Audit Spotlight
                  <Badge variant="warning">Intake Dossier Audit</Badge>
                </h3>
                <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                  Verified dossier audit results for the primary project enterprise record.
                </p>
              </div>
            </div>

            <Link href={`/leads/${summary.destinationCafeReport.leadId}`}>
              <Button size="sm" className="bg-amber-700 hover:bg-amber-800 text-white border-none shadow-xs">
                Inspect Destination Cafe <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* Identified Missing Contact Data */}
            <div className="p-3.5 bg-card border border-amber-200 dark:border-amber-800/80 rounded-lg space-y-2">
              <span className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                <Users className="w-4 h-4 text-amber-600" />
                Missing Contact Information
              </span>
              <ul className="space-y-1 text-muted-foreground text-[11px] list-disc list-inside">
                <li><strong className="text-foreground">POC Person:</strong> Null / Unprovided</li>
                <li><strong className="text-foreground">Designation:</strong> Null / Unprovided</li>
                <li><strong className="text-foreground">Phone Number:</strong> Null / Unprovided</li>
                <li><strong className="text-foreground">Email Address:</strong> Null / Unprovided</li>
              </ul>
              <p className="text-[10px] text-amber-700 dark:text-amber-400 italic pt-1 border-t border-border">
                Platform rule: Missing dossier values displayed as empty/null without dummy fabrication.
              </p>
            </div>

            {/* Score Discrepancy Analysis */}
            <div className="p-3.5 bg-card border border-amber-200 dark:border-amber-800/80 rounded-lg space-y-2">
              <span className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                <Award className="w-4 h-4 text-amber-600" />
                Lead Score Discrepancy
              </span>
              <div className="space-y-1 text-muted-foreground text-[11px]">
                <div className="flex justify-between">
                  <span>Recorded Score:</span>
                  <strong className="text-amber-700 dark:text-amber-400">18 / 30</strong>
                </div>
                <div className="flex justify-between">
                  <span>Individual Ratings Sum:</span>
                  <strong className="text-foreground">0 / 30</strong>
                </div>
                <div className="flex justify-between pt-1 border-t border-border font-semibold text-amber-900 dark:text-amber-200">
                  <span>Detected Difference:</span>
                  <span>18 Points</span>
                </div>
              </div>
              <p className="text-[10px] text-amber-700 dark:text-amber-400 italic">
                Preserves recorded intake score while calling out dimension rating mismatch.
              </p>
            </div>

            {/* Quality Score & Status */}
            <div className="p-3.5 bg-card border border-amber-200 dark:border-amber-800/80 rounded-lg space-y-2">
              <span className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                Quality Audit Metrics
              </span>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Quality Score:</span>
                  <Badge variant={getScoreBadgeVariant(summary.destinationCafeReport.qualityScore)}>
                    {summary.destinationCafeReport.qualityScore} / 100
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Completeness:</span>
                  <span className="font-bold text-foreground">
                    {summary.destinationCafeReport.completenessPercentage}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Issues:</span>
                  <span className="font-bold text-amber-700 dark:text-amber-300">
                    {summary.destinationCafeReport.totalIssuesCount} issues flagged
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Audit Inventory Table */}
      <Card>
        <CardHeader className="border-b border-border pb-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Lead Quality Audit Inventory ({filteredReports.length})
            </CardTitle>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Input */}
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search by company or domain..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-xs rounded-md bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <Select
              className="h-8 text-xs w-44"
              options={[
                { label: "All Audit Statuses", value: "ALL" },
                { label: "Needs Attention (<75%)", value: "CRITICAL" },
                { label: "Healthy (>=75%)", value: "HEALTHY" },
                { label: "Score Discrepancy", value: "DISCREPANCY" },
                { label: "Has Errors", value: "ERRORS" },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {filteredReports.length === 0 ? (
              <div className="text-center py-10 text-xs text-muted-foreground">
                No lead audit reports match the selected filters.
              </div>
            ) : (
              filteredReports.map((report) => {
                const isExpanded = expandedLeadId === report.leadId;

                return (
                  <div key={report.leadId} className="transition-colors hover:bg-muted/20">
                    <div
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                      onClick={() => toggleExpand(report.leadId)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary font-bold text-sm flex items-center justify-center w-9 h-9">
                          {report.company[0]}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-foreground flex items-center gap-2">
                            <span>{report.company}</span>
                            {report.isDestinationCafe && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                                Primary Lead
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                            <span>{report.domain || "Unspecified Sector"}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-semibold text-foreground">
                              {report.completenessPercentage}% Complete
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Audit Badges */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge variant={getScoreBadgeVariant(report.qualityScore)} className="text-xs px-2.5 py-0.5">
                          Score: {report.qualityScore} / 100
                        </Badge>

                        {report.hasScoreDiscrepancy && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Discrepancy ({report.discrepancyAmount}p)
                          </span>
                        )}

                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                          {report.errorCount > 0 && (
                            <span className="text-red-600 font-bold">{report.errorCount} errors</span>
                          )}
                          {report.warningCount > 0 && (
                            <span className="text-amber-600 font-semibold">{report.warningCount} warnings</span>
                          )}
                          {report.totalIssuesCount === 0 && (
                            <span className="text-emerald-600 font-semibold">Clean</span>
                          )}
                        </div>

                        <Link
                          href={`/leads/${report.leadId}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button size="sm" variant="ghost" className="h-8 text-xs">
                            Record <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        </Link>

                        <button className="text-muted-foreground hover:text-foreground">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Issues Drawer */}
                    {isExpanded && (
                      <div className="p-4 bg-muted/40 border-t border-border space-y-2 text-xs">
                        <div className="font-semibold text-foreground text-xs flex items-center gap-2">
                          <Info className="w-3.5 h-3.5 text-primary" />
                          Detailed Audit Issues ({report.issues.length})
                        </div>

                        {report.issues.length === 0 ? (
                          <p className="text-emerald-600 text-[11px] italic">
                            No quality issues or formatting errors detected for this record.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                            {report.issues.map((issue: QualityIssue, idx: number) => (
                              <div
                                key={idx}
                                className="p-2.5 rounded border border-border bg-card flex items-start gap-2 text-[11px]"
                              >
                                {getSeverityBadge(issue.severity)}
                                <div className="flex-1">
                                  <span className="font-semibold text-foreground">{issue.message}</span>
                                  {issue.field && (
                                    <span className="text-muted-foreground font-mono block text-[10px]">
                                      Field: {issue.field}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
