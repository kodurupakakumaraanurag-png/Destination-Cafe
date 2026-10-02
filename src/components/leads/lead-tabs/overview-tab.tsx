"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge, getPriorityBadgeVariant, getStatusBadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Building2,
  Calendar,
  Globe,
  Mail,
  MapPin,
  Phone,
  User,
  Activity as ActivityIcon,
  CheckSquare,
  Award,
  ArrowUpRight,
  Clock,
  Briefcase,
} from "lucide-react";
import { LeadDetailRecord, LeadActivity, LeadTask } from "@/types/lead-detail";

interface OverviewTabProps {
  lead: LeadDetailRecord;
  onOpenScoreModal: () => void;
  onOpenEditModal: () => void;
}

export function OverviewTab({ lead, onOpenScoreModal, onOpenEditModal }: OverviewTabProps) {
  const calculatedScore = lead.calculatedLeadScore ?? 0;
  const recordedScore = lead.recordedLeadScore;
  const hasDiscrepancy = recordedScore !== null && recordedScore !== undefined && recordedScore !== calculatedScore;
  const discrepancyDiff = recordedScore !== null && recordedScore !== undefined ? Math.abs(recordedScore - calculatedScore) : 0;

  const isDestinationCafe = lead.company === "Destination Cafe";

  return (
    <div className="space-y-6">
      {/* Score Discrepancy Alert Banner */}
      {hasDiscrepancy && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-md text-amber-700 dark:text-amber-300">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                Score discrepancy detected
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-200/70 text-amber-900 dark:bg-amber-900 dark:text-amber-100">
                  Difference: {discrepancyDiff} points
                </span>
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                This lead record has a recorded intake score of <strong>{recordedScore}/30</strong>, but individual ratings yield a calculated score of <strong>{calculatedScore}/30</strong>.
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200" onClick={onOpenScoreModal}>
            Review Scoring
          </Button>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-xs font-medium text-muted-foreground">Calculated Score</div>
          <div className="text-2xl font-bold text-foreground mt-1 flex items-baseline gap-1">
            <span>{calculatedScore}</span>
            <span className="text-xs text-muted-foreground font-normal">/ 30</span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
            <Award className="w-3 h-3 text-primary" />
            <span>Recorded: {recordedScore !== null && recordedScore !== undefined ? `${recordedScore}/30` : "None"}</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs font-medium text-muted-foreground">Status</div>
          <div className="mt-1">
            <Badge variant={getStatusBadgeVariant(lead.status)} className="text-xs px-2.5 py-0.5">
              {lead.status.replace("_", " ")}
            </Badge>
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">Current CRM Stage</div>
        </Card>

        <Card className="p-4">
          <div className="text-xs font-medium text-muted-foreground">Priority</div>
          <div className="mt-1">
            <Badge variant={getPriorityBadgeVariant(lead.priority)} className="text-xs px-2.5 py-0.5">
              {lead.priority}
            </Badge>
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">Urgency classification</div>
        </Card>

        <Card className="p-4">
          <div className="text-xs font-medium text-muted-foreground">Project Allocation</div>
          <div className="text-sm font-semibold text-foreground mt-1 truncate">
            {lead.projectAllocationStatus.replace(/_/g, " ")}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">Allocation status</div>
        </Card>
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Key Info & Business Context */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                Company & Intake Details
              </CardTitle>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={onOpenEditModal}>
                Edit Details
              </Button>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground font-medium block">Company Name</span>
                <span className="font-semibold text-foreground text-sm">{lead.company}</span>
              </div>
              <div>
                <span className="text-muted-foreground font-medium block">Domain / Sector</span>
                <span className="text-foreground">{lead.domain || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground font-medium block">Location</span>
                <span className="text-foreground flex items-start gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  {lead.location || "—"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground font-medium block">Website</span>
                {lead.website ? (
                  <span className="text-foreground flex items-center gap-1 mt-0.5">
                    <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    {lead.website.startsWith("http") ? (
                      <a href={lead.website} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-0.5">
                        {lead.website} <ArrowUpRight className="w-3 h-3" />
                      </a>
                    ) : (
                      <span>{lead.website}</span>
                    )}
                  </span>
                ) : (
                  "—"
                )}
              </div>
              <div>
                <span className="text-muted-foreground font-medium block">Lead Source</span>
                <span className="text-foreground">{lead.source || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground font-medium block">Contact Method</span>
                <span className="text-foreground">{lead.contactMethod || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground font-medium block">Date Added</span>
                <span className="text-foreground flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  {lead.dateAdded ? new Date(lead.dateAdded).toLocaleDateString() : "—"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground font-medium block">Assigned Owner</span>
                <span className="text-foreground flex items-center gap-1.5 mt-0.5">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  {lead.assignedUser?.name || lead.assignedUser?.email || "Unassigned"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                Business Understanding & Requirement
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs">
              <div>
                <h5 className="font-semibold text-foreground mb-1">Business Understanding</h5>
                <p className="text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded border border-border/50">
                  {lead.businessUnderstanding || "No detailed business understanding recorded."}
                </p>
              </div>
              <div>
                <h5 className="font-semibold text-foreground mb-1">Possible Problem</h5>
                <p className="text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded border border-border/50">
                  {lead.possibleProblem || "No specific problem identified."}
                </p>
              </div>
              <div>
                <h5 className="font-semibold text-foreground mb-1">Requirement</h5>
                <p className="text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded border border-border/50">
                  {lead.requirement || "No detailed requirement specified."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Column: Contact Quick Card, Activity & Task Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b border-border pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Primary Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 text-xs space-y-3">
              {isDestinationCafe && !lead.contactPerson ? (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 rounded border border-amber-200 dark:border-amber-800 space-y-1">
                  <p className="font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Unverified Dossier Contact
                  </p>
                  <p className="text-[11px] leading-normal text-amber-700 dark:text-amber-400">
                    No verified contact person, email, or direct phone was recorded in the Destination Cafe intake dossier.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                      {lead.contactPerson ? lead.contactPerson[0].toUpperCase() : "C"}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground text-sm">{lead.contactPerson || "No Contact Person"}</div>
                      <div className="text-muted-foreground">{lead.designation || "Unspecified Designation"}</div>
                    </div>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-border">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-3.5 h-3.5 text-primary" />
                      <span>{lead.phone || "No phone provided"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-3.5 h-3.5 text-primary" />
                      <span>{lead.email || "No email provided"}</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ActivityIcon className="w-4 h-4 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 text-xs">
              {lead.activities && lead.activities.length > 0 ? (
                <div className="space-y-3">
                  {lead.activities.slice(0, 3).map((act: LeadActivity) => (
                    <div key={act.id} className="p-2.5 rounded bg-muted/40 border border-border/40 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-foreground">{act.title}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(act.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {act.description && <p className="text-muted-foreground text-[11px] line-clamp-2">{act.description}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">No activities logged yet.</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-primary" />
                Open Tasks ({lead.tasks ? lead.tasks.filter((t: LeadTask) => t.status !== "COMPLETED").length : 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 text-xs">
              {lead.tasks && lead.tasks.length > 0 ? (
                <div className="space-y-2">
                  {lead.tasks.slice(0, 3).map((t: LeadTask) => (
                    <div key={t.id} className="p-2.5 rounded bg-muted/40 border border-border/40 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-foreground">{t.title}</div>
                        {t.dueDate && (
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" /> Due {new Date(t.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <Badge variant={getPriorityBadgeVariant(t.priority)} className="text-[10px]">
                        {t.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">No pending tasks for this lead.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
