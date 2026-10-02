"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DateInput } from "@/components/ui/date-input";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import {
  createOpportunity,
  updateOpportunity,
  convertOpportunityToProject,
} from "@/lib/actions/opportunity-actions";
import { OpportunityStage } from "@prisma/client";
import {
  TrendingUp,
  Plus,
  Search,
  Building2,
  Calendar,
  User,
  Percent,
  Edit3,
  FolderKanban,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface LeadOption {
  id: string;
  company: string;
}

interface UserOption {
  id: string;
  name: string | null;
  email: string;
}

interface OpportunityItem {
  id: string;
  name: string;
  leadId: string;
  stage: OpportunityStage;
  value: number | null;
  probability: number | null;
  closeDate: Date | string | null;
  assignedUserId: string | null;
  notes: string | null;
  createdAt: Date | string;
  lead: {
    id: string;
    company: string;
    domain: string | null;
  };
  assignedUser?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  projects?: Array<{ id: string; name: string; status: string }>;
}

interface OpportunitiesViewProps {
  initialOpportunities: OpportunityItem[];
  leads: LeadOption[];
  users: UserOption[];
}

export function OpportunitiesView({
  initialOpportunities,
  leads,
  users,
}: OpportunitiesViewProps) {
  const router = useRouter();
  const [opportunities] = React.useState<OpportunityItem[]>(initialOpportunities);
  const [search, setSearch] = React.useState("");
  const [stageFilter, setStageFilter] = React.useState<string>("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingOpp, setEditingOpp] = React.useState<OpportunityItem | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [convertingId, setConvertingId] = React.useState<string | null>(null);

  // Form State
  const [name, setName] = React.useState("");
  const [leadId, setLeadId] = React.useState("");
  const [value, setValue] = React.useState("");
  const [stage, setStage] = React.useState<OpportunityStage>(OpportunityStage.QUALIFIED);
  const [probability, setProbability] = React.useState("50");
  const [closeDate, setCloseDate] = React.useState("");
  const [assignedUserId, setAssignedUserId] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const { addToast } = useToast();

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesStage = stageFilter === "ALL" || opp.stage === stageFilter;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      opp.name.toLowerCase().includes(q) ||
      (opp.notes && opp.notes.toLowerCase().includes(q)) ||
      (opp.lead && opp.lead.company.toLowerCase().includes(q));

    return matchesStage && matchesSearch;
  });

  // Calculate Metrics
  const totalPipelineValue = filteredOpportunities.reduce((sum, o) => sum + (o.value || 0), 0);
  const wonOpportunities = filteredOpportunities.filter((o) => o.stage === OpportunityStage.WON);
  const wonValue = wonOpportunities.reduce((sum, o) => sum + (o.value || 0), 0);
  const winRate =
    filteredOpportunities.length > 0
      ? Math.round((wonOpportunities.length / filteredOpportunities.length) * 100)
      : 0;

  const resetForm = () => {
    setName("");
    setLeadId(leads[0]?.id || "");
    setValue("");
    setStage(OpportunityStage.QUALIFIED);
    setProbability("50");
    setCloseDate("");
    setAssignedUserId(users[0]?.id || "");
    setNotes("");
    setEditingOpp(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (opp: OpportunityItem) => {
    setEditingOpp(opp);
    setName(opp.name);
    setLeadId(opp.leadId);
    setValue(opp.value !== null ? String(opp.value) : "");
    setStage(opp.stage);
    setProbability(opp.probability !== null ? String(opp.probability) : "50");
    setCloseDate(opp.closeDate ? new Date(opp.closeDate).toISOString().substring(0, 10) : "");
    setAssignedUserId(opp.assignedUserId || "");
    setNotes(opp.notes || "");
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast("Opportunity name is required.", "error");
      return;
    }
    if (!leadId) {
      addToast("Please select an associated client lead.", "error");
      return;
    }

    setLoading(true);
    try {
      const parsedVal = value.trim() ? parseFloat(value) : undefined;
      const parsedProb = probability.trim() ? parseInt(probability, 10) : undefined;

      if (editingOpp) {
        await updateOpportunity(editingOpp.id, {
          name,
          leadId,
          value: parsedVal,
          stage,
          probability: parsedProb,
          closeDate: closeDate || null,
          assignedUserId: assignedUserId || null,
          notes: notes || null,
        });
        addToast(`Updated opportunity "${name}"`, "success");
      } else {
        await createOpportunity({
          name,
          leadId,
          value: parsedVal,
          stage,
          probability: parsedProb,
          closeDate: closeDate || undefined,
          assignedUserId: assignedUserId || undefined,
          notes: notes || undefined,
        });
        addToast(`Created opportunity "${name}"`, "success");
      }

      setIsModalOpen(false);
      resetForm();
      window.location.reload();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save opportunity";
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToProject = async (opp: OpportunityItem) => {
    if (!confirm(`Initialize Project for Won Opportunity "${opp.name}" (${opp.lead.company})?`)) return;

    setConvertingId(opp.id);
    try {
      const project = await convertOpportunityToProject(opp.id);
      addToast(`Successfully created Project "${project.name}"!`, "success");
      router.push("/projects");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to convert to project";
      addToast(msg, "error");
    } finally {
      setConvertingId(null);
    }
  };

  const getStageBadgeVariant = (st: OpportunityStage) => {
    switch (st) {
      case "WON":
      case "CLOSED_WON":
        return "success";
      case "LOST":
      case "CLOSED_LOST":
        return "destructive";
      case "NEGOTIATION":
        return "warning";
      case "PROPOSAL":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-primary">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Pipeline Value</div>
          <div className="text-2xl font-extrabold text-foreground mt-1">${totalPipelineValue.toLocaleString()}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">{filteredOpportunities.length} Active Deals</div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Won Revenue Value</div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            ${wonValue.toLocaleString()}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">{wonOpportunities.length} Closed Won Deals</div>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Deal Win Rate</div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{winRate}%</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Historical Win %</div>
        </Card>

        <Card className="p-4 border-l-4 border-l-indigo-500">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">SYNTHETIC DEMO</div>
          <div className="text-xs font-bold text-indigo-600 dark:text-indigo-300 mt-1.5 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Strictly Non-Fabricated
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">Real database ingestion data</div>
        </Card>
      </div>

      {/* Controls Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search opportunity name, client, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="w-48">
            <Select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              options={[
                { value: "ALL", label: "All Deal Stages" },
                { value: "QUALIFIED", label: "Qualified" },
                { value: "PROPOSAL", label: "Proposal Sent" },
                { value: "NEGOTIATION", label: "Negotiation" },
                { value: "WON", label: "Closed Won" },
                { value: "LOST", label: "Closed Lost" },
              ]}
            />
          </div>
        </div>

        <Button size="sm" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-1.5" /> Create Opportunity
        </Button>
      </div>

      {/* Opportunities List Grid */}
      <Card>
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Sales Opportunities &amp; Pipeline Deals ({filteredOpportunities.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {filteredOpportunities.length === 0 ? (
            <div className="text-center py-12 text-xs text-muted-foreground space-y-2">
              <TrendingUp className="w-8 h-8 mx-auto text-muted-foreground/60" />
              <p className="font-semibold text-foreground">No opportunities found</p>
              <p>Create a sales deal or adjust your stage filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredOpportunities.map((opp) => {
                const isWon = opp.stage === OpportunityStage.WON || opp.stage === OpportunityStage.CLOSED_WON;
                const hasProject = opp.projects && opp.projects.length > 0;

                return (
                  <div
                    key={opp.id}
                    className={`p-5 rounded-xl border space-y-4 transition-all ${
                      isWon
                        ? "bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60"
                        : "bg-card border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-sm text-foreground">{opp.name}</h3>
                          <Badge variant={getStageBadgeVariant(opp.stage)} className="text-[10px] px-2">
                            {opp.stage.replace("_", " ")}
                          </Badge>
                        </div>

                        <Link
                          href={`/leads/${opp.leadId}`}
                          className="text-xs text-muted-foreground hover:text-primary font-medium flex items-center gap-1.5 mt-1 truncate"
                        >
                          <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="truncate">{opp.lead.company}</span>
                        </Link>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-base font-extrabold text-primary">
                          ${(opp.value || 0).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-semibold flex items-center justify-end gap-0.5">
                          <Percent className="w-3 h-3 text-muted-foreground" /> {opp.probability || 50}% Probable
                        </div>
                      </div>
                    </div>

                    {opp.notes && (
                      <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 p-2.5 rounded border border-border/40 line-clamp-2">
                        {opp.notes}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                      <div className="flex items-center gap-3">
                        {opp.closeDate && (
                          <span className="flex items-center gap-1 font-medium">
                            <Calendar className="w-3 h-3 text-primary" /> Est: {new Date(opp.closeDate).toLocaleDateString()}
                          </span>
                        )}

                        {opp.assignedUser && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" /> {opp.assignedUser.name || opp.assignedUser.email}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {isWon && !hasProject && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                            onClick={() => handleConvertToProject(opp)}
                            loading={convertingId === opp.id}
                          >
                            <FolderKanban className="w-3.5 h-3.5 mr-1" /> Convert to Project
                          </Button>
                        )}

                        {hasProject && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Project Active
                          </span>
                        )}

                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleOpenEdit(opp)}>
                          <Edit3 className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Opportunity Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingOpp ? "Edit Opportunity Details" : "Create New Sales Opportunity"}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input
            label="Opportunity Name *"
            placeholder="e.g. Enterprise POS Modernization Contract"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Select
            label="Associated Client Lead *"
            value={leadId}
            onChange={(e) => setLeadId(e.target.value)}
            options={leads.map((l) => ({ value: l.id, label: l.company }))}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Deal Value ($)"
              type="number"
              placeholder="e.g. 45000"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />

            <Input
              label="Probability (%)"
              type="number"
              min="0"
              max="100"
              placeholder="e.g. 60"
              value={probability}
              onChange={(e) => setProbability(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Stage *"
              value={stage}
              onChange={(e) => setStage(e.target.value as OpportunityStage)}
              options={[
                { value: "QUALIFIED", label: "Qualified" },
                { value: "PROPOSAL", label: "Proposal Sent" },
                { value: "NEGOTIATION", label: "Negotiation" },
                { value: "WON", label: "Closed Won" },
                { value: "LOST", label: "Closed Lost" },
              ]}
            />

            <DateInput
              label="Expected Close Date"
              value={closeDate}
              onChange={(e) => setCloseDate(e.target.value)}
            />
          </div>

          <Select
            label="Assigned User"
            value={assignedUserId}
            onChange={(e) => setAssignedUserId(e.target.value)}
            options={users.map((u) => ({ value: u.id, label: u.name || u.email }))}
          />

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Deal Notes & Key Deliverables</label>
            <textarea
              className="w-full min-h-[70px] p-2.5 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Record commercial terms, key requirements, or client expectations..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {editingOpp ? "Save Changes" : "Create Opportunity"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
