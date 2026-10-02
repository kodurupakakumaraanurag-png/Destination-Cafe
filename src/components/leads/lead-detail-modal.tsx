"use client";

import { Dialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SerializedLead } from "@/components/leads/lead-table";
import { Building2, User, Mail, Phone, MapPin, Globe, Star, AlertTriangle, Edit } from "lucide-react";

interface LeadDetailModalProps {
  lead: SerializedLead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (lead: SerializedLead) => void;
}

export function LeadDetailModal({
  lead,
  open,
  onOpenChange,
  onEdit,
}: LeadDetailModalProps) {
  if (!lead) return null;

  const hasDiscrepancy =
    lead.recordedLeadScore !== null &&
    lead.calculatedLeadScore !== null &&
    lead.recordedLeadScore !== lead.calculatedLeadScore;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-2xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-4 pr-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">{lead.company}</h2>
              <Badge variant="default">{lead.priority} Priority</Badge>
              <Badge variant="success">{lead.status}</Badge>
            </div>
            {lead.domain && <p className="text-xs text-muted-foreground">{lead.domain} Sector</p>}
          </div>

          <div className="flex items-center gap-2">
            <a href={`/leads/${lead.id}`}>
              <Button size="sm">
                <span>View Full Record</span>
              </Button>
            </a>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(lead)}>
                <Edit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </Button>
            )}
          </div>
        </div>

        {/* Lead Discrepancy Callout if applicable */}
        {hasDiscrepancy && (
          <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Intake Score Discrepancy Recorded</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Recorded intake score is <strong className="text-foreground">{lead.recordedLeadScore}</strong> whereas 6-dimensional calculated sum is <strong className="text-foreground">{lead.calculatedLeadScore}</strong>.
            </p>
          </div>
        )}

        {/* Detail Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Location & Website */}
          <div className="p-3.5 rounded-lg bg-secondary/50 border border-border space-y-2">
            <h4 className="font-semibold text-foreground flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>Location &amp; Digital Presence</span>
            </h4>
            <p className="text-muted-foreground">{lead.location || "No location recorded"}</p>
            <div className="flex items-center gap-1.5 text-muted-foreground pt-1">
              <Globe className="w-3.5 h-3.5" />
              <span>{lead.website || "No website recorded"}</span>
            </div>
          </div>

          {/* Contact Person */}
          <div className="p-3.5 rounded-lg bg-secondary/50 border border-border space-y-2">
            <h4 className="font-semibold text-foreground flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary" />
              <span>Contact Person</span>
            </h4>
            <p className="text-foreground font-semibold">
              {lead.contactPerson || "null (No contact person recorded)"}
            </p>
            {lead.designation && <p className="text-muted-foreground">{lead.designation}</p>}
            <div className="space-y-0.5 pt-1 text-muted-foreground">
              <p className="flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-muted-foreground" />
                <span>{lead.phone || "null"}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-muted-foreground" />
                <span>{lead.email || "null"}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Business Overview */}
        <div className="p-3.5 rounded-lg bg-secondary/40 border border-border text-xs space-y-2">
          <h4 className="font-semibold text-foreground">Business Overview &amp; Requirements</h4>
          <p className="text-muted-foreground leading-relaxed">
            {lead.businessUnderstanding || "No business overview provided."}
          </p>
          {lead.possibleProblem && (
            <p className="text-muted-foreground">
              <strong className="text-foreground">Problem:</strong> {lead.possibleProblem}
            </p>
          )}
          {lead.requirement && (
            <p className="text-muted-foreground">
              <strong className="text-foreground">Requirement:</strong> {lead.requirement}
            </p>
          )}
        </div>

        {/* 6 Dimension Scores */}
        <div className="p-3.5 rounded-lg bg-card border border-border space-y-3">
          <div className="flex items-center justify-between text-xs">
            <h4 className="font-bold text-foreground flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-500" />
              <span>Intake Scoring Dimensions (0 to 5)</span>
            </h4>
            <span className="font-bold text-primary">Total: {lead.calculatedLeadScore ?? 0} / 30</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
            <div className="p-2 rounded bg-secondary/50 border border-border">
              <span className="text-muted-foreground">Digital Presence:</span>
              <span className="font-bold text-foreground ml-1.5">{lead.digitalPresenceScore}</span>
            </div>
            <div className="p-2 rounded bg-secondary/50 border border-border">
              <span className="text-muted-foreground">Hiring Activity:</span>
              <span className="font-bold text-foreground ml-1.5">{lead.hiringActivityScore}</span>
            </div>
            <div className="p-2 rounded bg-secondary/50 border border-border">
              <span className="text-muted-foreground">Tech Stack Fit:</span>
              <span className="font-bold text-foreground ml-1.5">{lead.techStackFitScore}</span>
            </div>
            <div className="p-2 rounded bg-secondary/50 border border-border">
              <span className="text-muted-foreground">Funding/Revenue:</span>
              <span className="font-bold text-foreground ml-1.5">{lead.fundingRevenueScore}</span>
            </div>
            <div className="p-2 rounded bg-secondary/50 border border-border">
              <span className="text-muted-foreground">Project Urgency:</span>
              <span className="font-bold text-foreground ml-1.5">{lead.projectUrgencyScore}</span>
            </div>
            <div className="p-2 rounded bg-secondary/50 border border-border">
              <span className="text-muted-foreground">Budget Clarity:</span>
              <span className="font-bold text-foreground ml-1.5">{lead.budgetClarityScore}</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border">
          <span>Date Added: {lead.dateAdded ? new Date(lead.dateAdded).toLocaleDateString() : "—"}</span>
          <span>Source: {lead.source || "—"}</span>
          <span>Allocation: {lead.projectAllocationStatus}</span>
        </div>
      </div>
    </Dialog>
  );
}
