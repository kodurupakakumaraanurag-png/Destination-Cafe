"use client";

import * as React from "react";
import Link from "next/link";
import { Badge, getPriorityBadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { updateLeadStage } from "@/lib/actions/lead-actions";
import { LeadStatus, Priority } from "@prisma/client";
import {
  Building2,
  Search,
  User,
  AlertTriangle,
  Award,
  Kanban,
  List,
  ExternalLink,
} from "lucide-react";

export interface PipelineLead {
  id: string;
  company: string;
  domain: string | null;
  status: LeadStatus;
  priority: Priority;
  calculatedLeadScore: number | null;
  recordedLeadScore: number | null;
  nextAction: string | null;
  source: string | null;
  assignedUserId: string | null;
  assignedUser: { id: string; name: string | null; email: string } | null;
  tasks?: { title: string; dueDate: Date | string | null }[];
  dateAdded?: Date | string | null;
  createdAt: Date | string;
}

interface PipelineBoardProps {
  initialLeads: PipelineLead[];
  users: { id: string; name: string | null; email: string }[];
}

const PIPELINE_STAGES: { id: LeadStatus; label: string; color: string }[] = [
  { id: LeadStatus.NEW, label: "New", color: "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800" },
  { id: LeadStatus.CONTACTED, label: "Contacted", color: "bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-800" },
  { id: LeadStatus.QUALIFIED, label: "Qualified", color: "bg-indigo-500/10 text-indigo-600 border-indigo-200 dark:border-indigo-800" },
  { id: LeadStatus.PROPOSAL, label: "Proposal", color: "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800" },
  { id: LeadStatus.NEGOTIATION, label: "Negotiation", color: "bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-800" },
  { id: LeadStatus.WON, label: "Won", color: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800" },
  { id: LeadStatus.LOST, label: "Lost", color: "bg-red-500/10 text-red-600 border-red-200 dark:border-red-800" },
];

export function PipelineBoard({ initialLeads, users }: PipelineBoardProps) {
  const [leads, setLeads] = React.useState<PipelineLead[]>(initialLeads);
  const [search, setSearch] = React.useState("");
  const [priorityFilter, setPriorityFilter] = React.useState("ALL");
  const [userFilter, setUserFilter] = React.useState("ALL");
  const [viewMode, setViewMode] = React.useState<"kanban" | "list">("kanban");
  const [draggedLeadId, setDraggedLeadId] = React.useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = React.useState<LeadStatus | null>(null);

  const { addToast } = useToast();

  // Filtered leads
  const filteredLeads = React.useMemo(() => {
    return leads.filter((lead) => {
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesCompany = lead.company.toLowerCase().includes(query);
        const matchesDomain = lead.domain?.toLowerCase().includes(query) || false;
        if (!matchesCompany && !matchesDomain) return false;
      }

      if (priorityFilter !== "ALL" && lead.priority !== priorityFilter) {
        return false;
      }

      if (userFilter !== "ALL" && lead.assignedUserId !== userFilter) {
        return false;
      }

      return true;
    });
  }, [leads, search, priorityFilter, userFilter]);

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.setData("text/plain", leadId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, stageId: LeadStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverStage !== stageId) {
      setDragOverStage(stageId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverStage(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStage: LeadStatus) => {
    e.preventDefault();
    setDragOverStage(null);
    const leadId = e.dataTransfer.getData("text/plain") || draggedLeadId;
    if (!leadId) return;

    const targetLead = leads.find((l) => l.id === leadId);
    if (!targetLead || targetLead.status === targetStage) return;

    const oldStage = targetLead.status;

    // Optimistic UI Update
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: targetStage } : l))
    );

    try {
      await updateLeadStage(leadId, targetStage);
      addToast(`Moved ${targetLead.company} to ${targetStage.replace(/_/g, " ")}`, "success");
    } catch (err: unknown) {
      // Revert optimistic update on failure
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: oldStage } : l))
      );
      const msg = err instanceof Error ? err.message : "Failed to update lead stage";
      addToast(msg, "error");
    } finally {
      setDraggedLeadId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls & Filter Bar */}
      <div className="p-4 bg-card border border-border rounded-xl shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search leads in pipeline by company or domain..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs rounded-md bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Filters & View Toggle */}
          <div className="flex items-center gap-2 flex-wrap">
            <Select
              className="h-9 text-xs w-36"
              options={[
                { label: "All Priorities", value: "ALL" },
                { label: "Low", value: Priority.LOW },
                { label: "Medium", value: Priority.MEDIUM },
                { label: "High", value: Priority.HIGH },
                { label: "Urgent", value: Priority.URGENT },
              ]}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            />

            <Select
              className="h-9 text-xs w-44"
              options={[
                { label: "All Assigned Users", value: "ALL" },
                ...users.map((u) => ({ label: u.name || u.email, value: u.id })),
              ]}
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
            />

            {/* View Mode Toggle */}
            <div className="flex items-center border border-border rounded-md bg-muted/40 p-0.5">
              <button
                onClick={() => setViewMode("kanban")}
                className={`p-1.5 rounded-sm text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                  viewMode === "kanban" ? "bg-card text-foreground font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
                title="Kanban Board View"
              >
                <Kanban className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Board</span>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-sm text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                  viewMode === "list" ? "bg-card text-foreground font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
                title="List Table View"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Board View */}
      {viewMode === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 overflow-x-auto pb-4">
          {PIPELINE_STAGES.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => l.status === stage.id);
            const totalScoreSum = stageLeads.reduce((acc, l) => acc + (l.calculatedLeadScore || 0), 0);
            const isTargetDrop = dragOverStage === stage.id;

            return (
              <div
                key={stage.id}
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage.id)}
                className={`flex flex-col min-h-[500px] rounded-xl border transition-all ${
                  isTargetDrop
                    ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                    : "border-border/60 bg-muted/30"
                }`}
              >
                {/* Stage Header */}
                <div className="p-3 border-b border-border/60 flex items-center justify-between bg-card/80 rounded-t-xl">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${stage.color}`}>
                      {stage.label}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground">
                      ({stageLeads.length})
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono" title="Total score sum">
                    {totalScoreSum} pts
                  </span>
                </div>

                {/* Cards Container */}
                <div className="p-2.5 space-y-3 flex-1 overflow-y-auto">
                  {stageLeads.length === 0 ? (
                    <div className="h-32 border border-dashed border-border/60 rounded-lg flex items-center justify-center text-muted-foreground text-[11px] italic">
                      Drag lead here
                    </div>
                  ) : (
                    stageLeads.map((lead) => {
                      const calculatedScore = lead.calculatedLeadScore ?? 0;
                      const recordedScore = lead.recordedLeadScore;
                      const hasDiscrepancy =
                        recordedScore !== null && recordedScore !== undefined && recordedScore !== calculatedScore;
                      const isDraggingThis = draggedLeadId === lead.id;

                      return (
                        <div
                          key={lead.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, lead.id)}
                          className={`p-3 rounded-lg border bg-card text-card-foreground shadow-2xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing space-y-2.5 group ${
                            isDraggingThis ? "opacity-40 scale-95 border-dashed border-primary" : "border-border hover:border-primary/50"
                          }`}
                        >
                          {/* Company Name & Link */}
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <Link
                                href={`/leads/${lead.id}`}
                                className="font-bold text-xs text-foreground hover:text-primary transition-colors flex items-center gap-1 group-hover:underline"
                              >
                                <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                                <span className="line-clamp-1">{lead.company}</span>
                              </Link>
                              {lead.domain && (
                                <span className="text-[10px] text-muted-foreground block truncate mt-0.5">
                                  {lead.domain}
                                </span>
                              )}
                            </div>
                            <Badge variant={getPriorityBadgeVariant(lead.priority)} className="text-[9px] px-1.5 py-0 shrink-0">
                              {lead.priority}
                            </Badge>
                          </div>

                          {/* Score & Discrepancy Pill */}
                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/40">
                            <span className="flex items-center gap-1 font-semibold text-foreground">
                              <Award className="w-3 h-3 text-primary shrink-0" />
                              {calculatedScore}/30
                            </span>
                            {hasDiscrepancy && (
                              <span
                                className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-0.5"
                                title={`Recorded score is ${recordedScore}/30 vs calculated ${calculatedScore}/30`}
                              >
                                <AlertTriangle className="w-2.5 h-2.5" />
                                <span>Discrepancy</span>
                              </span>
                            )}
                          </div>

                          {/* Next Follow-Up */}
                          {lead.nextAction && (
                            <div className="text-[10px] text-muted-foreground bg-muted/40 p-1.5 rounded border border-border/40 line-clamp-1">
                              Action: {lead.nextAction}
                            </div>
                          )}

                          {/* Assigned Owner Footer */}
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                            <span className="flex items-center gap-1 truncate">
                              <User className="w-3 h-3 text-muted-foreground shrink-0" />
                              <span className="truncate">{lead.assignedUser?.name || lead.assignedUser?.email || "Unassigned"}</span>
                            </span>
                            <Link href={`/leads/${lead.id}`} className="text-primary hover:underline flex items-center gap-0.5">
                              View <ExternalLink className="w-2.5 h-2.5" />
                            </Link>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View Alternative */
        <div className="p-4 bg-card border border-border rounded-xl space-y-3 text-xs">
          <div className="font-bold text-sm text-foreground pb-2 border-b border-border">
            Pipeline List Summary ({filteredLeads.length} leads)
          </div>
          <div className="space-y-2">
            {filteredLeads.map((lead) => (
              <div key={lead.id} className="p-3 rounded-lg border border-border bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                    {lead.company[0]}
                  </div>
                  <div>
                    <Link href={`/leads/${lead.id}`} className="font-bold text-sm text-foreground hover:text-primary">
                      {lead.company}
                    </Link>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                      <span>Domain: {lead.domain || "—"}</span>
                      <span>•</span>
                      <span>Assigned: {lead.assignedUser?.name || "Unassigned"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant={getPriorityBadgeVariant(lead.priority)} className="text-xs">
                    {lead.priority}
                  </Badge>
                  <span className="font-bold text-primary px-2.5 py-1 rounded bg-primary/10">
                    Score: {lead.calculatedLeadScore ?? 0}/30
                  </span>
                  <Select
                    className="h-8 text-xs w-36"
                    value={lead.status}
                    onChange={(e) => {
                      const newStage = e.target.value as LeadStatus;
                      updateLeadStage(lead.id, newStage).then(() => {
                        addToast(`Moved ${lead.company} stage`, "success");
                        setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, status: newStage } : l)));
                      });
                    }}
                    options={PIPELINE_STAGES.map((s) => ({ label: s.label, value: s.id }))}
                  />
                  <Link href={`/leads/${lead.id}`}>
                    <Button size="sm" variant="outline" className="h-8">
                      View Record
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
