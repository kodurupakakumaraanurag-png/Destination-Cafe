"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge, getPriorityBadgeVariant, getStatusBadgeVariant } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { archiveLead } from "@/lib/actions/lead-actions";
import { OverviewTab } from "./lead-tabs/overview-tab";
import { ContactTab } from "./lead-tabs/contact-tab";
import { BusinessTab } from "./lead-tabs/business-tab";
import { ScoringTab } from "./lead-tabs/scoring-tab";
import { ActivityTab } from "./lead-tabs/activity-tab";
import { TasksTab } from "./lead-tabs/tasks-tab";
import { DataQualityTab } from "./lead-tabs/data-quality-tab";
import { AuditHistoryTab } from "./lead-tabs/audit-history-tab";
import { LeadScoreEditModal } from "./lead-score-edit-modal";
import { LeadForm } from "./lead-form";
import { Dialog } from "@/components/ui/dialog";
import { LeadDetailRecord, LeadAuditLog, LeadUser } from "@/types/lead-detail";
import { Priority, LeadStatus, ProjectAllocationStatus } from "@prisma/client";

import {
  ArrowLeft,
  Building2,
  Globe,
  Sliders,
  Edit3,
  Archive,
  Award,
} from "lucide-react";

interface LeadDetailViewProps {
  lead: LeadDetailRecord;
  auditLogs: LeadAuditLog[];
  users: LeadUser[];
}

export function LeadDetailView({ lead, auditLogs, users }: LeadDetailViewProps) {
  const router = useRouter();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = React.useState("overview");
  const [isScoreModalOpen, setIsScoreModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [archiving, setArchiving] = React.useState(false);

  const calculatedScore = lead.calculatedLeadScore ?? 0;
  const recordedScore = lead.recordedLeadScore;
  const hasDiscrepancy = recordedScore !== null && recordedScore !== undefined && recordedScore !== calculatedScore;
  const discrepancyDiff = recordedScore !== null && recordedScore !== undefined ? Math.abs(recordedScore - calculatedScore) : 0;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "contact", label: "Contact" },
    { id: "business", label: "Business" },
    { id: "scoring", label: "Scoring" },
    { id: "activity", label: "Activity", count: lead.activities?.length || 0 },
    { id: "tasks", label: "Tasks", count: lead.tasks?.length || 0 },
    { id: "data-quality", label: "Data Quality" },
    { id: "audit-history", label: "Audit History", count: auditLogs?.length || 0 },
  ];

  const handleArchive = async () => {
    if (!confirm(`Are you sure you want to archive lead "${lead.company}"?`)) return;
    setArchiving(true);
    try {
      await archiveLead(lead.id);
      addToast("Lead archived successfully", "success");
      router.push("/crm/leads");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to archive lead";
      addToast(msg, "error");
    } finally {
      setArchiving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="p-6 bg-card border border-border rounded-xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Link href="/crm/leads">
              <Button variant="outline" size="sm" className="h-9 w-9 p-0 shrink-0">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  {lead.company}
                </h1>
                {lead.domain && (
                  <span className="text-xs px-2 py-0.5 rounded font-medium bg-muted text-muted-foreground">
                    {lead.domain}
                  </span>
                )}
                <Badge variant={getStatusBadgeVariant(lead.status)} className="text-xs px-2.5 py-0.5">
                  {lead.status.replace("_", " ")}
                </Badge>
                <Badge variant={getPriorityBadgeVariant(lead.priority)} className="text-xs px-2.5 py-0.5">
                  {lead.priority}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2 flex-wrap">
                {lead.website && (
                  <span className="flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                    {lead.website}
                  </span>
                )}
                <span>Location: {lead.location || "Unspecified"}</span>
                <span>Assigned: {lead.assignedUser?.name || lead.assignedUser?.email || "Unassigned"}</span>
              </div>
            </div>
          </div>

          {/* Header Action Buttons & Score Summary */}
          <div className="flex flex-wrap items-center gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-border">
            <div className="px-3.5 py-1.5 bg-muted/60 border border-border rounded-lg flex items-center gap-2">
              <Award className="w-4 h-4 text-primary shrink-0" />
              <div>
                <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Lead Score</div>
                <div className="text-sm font-bold text-foreground leading-tight flex items-center gap-1.5">
                  <span>{calculatedScore}/30</span>
                  {hasDiscrepancy && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                      Discrepancy ({discrepancyDiff}p)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={() => setIsScoreModalOpen(true)}>
              <Sliders className="w-3.5 h-3.5 mr-1.5 text-primary" /> Scoring
            </Button>

            <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}>
              <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Edit
            </Button>

            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 dark:text-red-400 border-red-200 dark:border-red-900" onClick={handleArchive} loading={archiving}>
              <Archive className="w-3.5 h-3.5 mr-1.5" /> Archive
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="pt-2">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>
      </div>

      {/* Tab Contents */}
      <div>
        {activeTab === "overview" && (
          <OverviewTab
            lead={lead}
            onOpenScoreModal={() => setIsScoreModalOpen(true)}
            onOpenEditModal={() => setIsEditModalOpen(true)}
          />
        )}
        {activeTab === "contact" && (
          <ContactTab
            lead={lead}
            onOpenEditModal={() => setIsEditModalOpen(true)}
          />
        )}
        {activeTab === "business" && <BusinessTab lead={lead} />}
        {activeTab === "scoring" && (
          <ScoringTab
            lead={lead}
            onOpenScoreModal={() => setIsScoreModalOpen(true)}
          />
        )}
        {activeTab === "activity" && <ActivityTab lead={lead} />}
        {activeTab === "tasks" && <TasksTab lead={lead} />}
        {activeTab === "data-quality" && <DataQualityTab lead={lead} />}
        {activeTab === "audit-history" && <AuditHistoryTab auditLogs={auditLogs} />}
      </div>

      {/* Scoring Edit Modal */}
      <LeadScoreEditModal
        key={`score-${lead.id}`}
        isOpen={isScoreModalOpen}
        onClose={() => setIsScoreModalOpen(false)}
        leadId={lead.id}
        companyName={lead.company}
        initialScores={{
          digitalPresenceScore: lead.digitalPresenceScore ?? 0,
          hiringActivityScore: lead.hiringActivityScore ?? 0,
          techStackFitScore: lead.techStackFitScore ?? 0,
          fundingRevenueScore: lead.fundingRevenueScore ?? 0,
          projectUrgencyScore: lead.projectUrgencyScore ?? 0,
          budgetClarityScore: lead.budgetClarityScore ?? 0,
          recordedLeadScore: lead.recordedLeadScore,
        }}
      />

      {/* Full Edit Lead Form Modal */}
      <Dialog
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Lead — ${lead.company}`}
        maxWidth="max-w-4xl"
      >
        <LeadForm
          initialData={{
            company: lead.company,
            domain: lead.domain || "",
            location: lead.location || "",
            website: lead.website || "",
            contactPerson: lead.contactPerson || "",
            designation: lead.designation || "",
            phone: lead.phone || "",
            email: lead.email || "",
            businessUnderstanding: lead.businessUnderstanding || "",
            possibleProblem: lead.possibleProblem || "",
            requirement: lead.requirement || "",
            opportunity: lead.opportunity || "",
            priority: lead.priority as Priority,
            status: lead.status as LeadStatus,
            nextAction: lead.nextAction || "",
            dateAdded: lead.dateAdded ? new Date(lead.dateAdded).toISOString().split("T")[0] : "",
            source: lead.source || "",
            contactMethod: lead.contactMethod || "",
            digitalPresenceScore: lead.digitalPresenceScore ?? 0,
            hiringActivityScore: lead.hiringActivityScore ?? 0,
            techStackFitScore: lead.techStackFitScore ?? 0,
            fundingRevenueScore: lead.fundingRevenueScore ?? 0,
            projectUrgencyScore: lead.projectUrgencyScore ?? 0,
            budgetClarityScore: lead.budgetClarityScore ?? 0,
            recordedLeadScore: lead.recordedLeadScore,
            projectAllocationStatus: (lead.projectAllocationStatus as ProjectAllocationStatus) || ProjectAllocationStatus.AVAILABLE_FOR_SELECTION,
            assignedUserId: lead.assignedUserId || "",
          }}
          leadId={lead.id}
          users={users}
          onSuccess={() => setIsEditModalOpen(false)}
        />
      </Dialog>
    </div>
  );
}
