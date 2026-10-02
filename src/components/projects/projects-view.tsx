"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DateInput } from "@/components/ui/date-input";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { createProject, updateProject, deleteProject } from "@/lib/actions/project-actions";
import { ProjectStatus } from "@prisma/client";
import {
  FolderKanban,
  Plus,
  Search,
  Building2,
  Calendar,
  User,
  Users,
  Edit3,
  Trash2,
  Clock,
  TrendingUp,
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

interface ProjectItem {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  startDate: Date | string | null;
  targetDate: Date | string | null;
  leadId: string | null;
  opportunityId: string | null;
  projectManagerId: string | null;
  createdAt: Date | string;
  lead?: {
    id: string;
    company: string;
    domain: string | null;
  } | null;
  opportunity?: {
    id: string;
    name: string;
    value: number | null;
    stage: string;
  } | null;
  projectManager?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  members?: Array<{
    id: string;
    role: string | null;
    user: { id: string; name: string | null; email: string };
  }>;
}

interface ProjectsViewProps {
  initialProjects: ProjectItem[];
  leads: LeadOption[];
  users: UserOption[];
}

export function ProjectsView({
  initialProjects,
  leads,
  users,
}: ProjectsViewProps) {
  const [projects, setProjects] = React.useState<ProjectItem[]>(initialProjects);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState<ProjectItem | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Form State
  const [name, setName] = React.useState("");
  const [leadId, setLeadId] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [status, setStatus] = React.useState<ProjectStatus>(ProjectStatus.PLANNED);
  const [startDate, setStartDate] = React.useState("");
  const [targetDate, setTargetDate] = React.useState("");
  const [projectManagerId, setProjectManagerId] = React.useState("");

  const { addToast } = useToast();

  const filteredProjects = projects.filter((p) => {
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.lead && p.lead.company.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  // Calculate Metrics
  const activeProjects = filteredProjects.filter((p) => p.status === ProjectStatus.ACTIVE);
  const plannedProjects = filteredProjects.filter((p) => p.status === ProjectStatus.PLANNED);
  const completedProjects = filteredProjects.filter((p) => p.status === ProjectStatus.COMPLETED);

  const resetForm = () => {
    setName("");
    setLeadId("");
    setDescription("");
    setStatus(ProjectStatus.PLANNED);
    setStartDate("");
    setTargetDate("");
    setProjectManagerId(users[0]?.id || "");
    setEditingProject(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (project: ProjectItem) => {
    setEditingProject(project);
    setName(project.name);
    setLeadId(project.leadId || "");
    setDescription(project.description || "");
    setStatus(project.status);
    setStartDate(project.startDate ? new Date(project.startDate).toISOString().substring(0, 10) : "");
    setTargetDate(project.targetDate ? new Date(project.targetDate).toISOString().substring(0, 10) : "");
    setProjectManagerId(project.projectManagerId || "");
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast("Project name is required.", "error");
      return;
    }

    setLoading(true);
    try {
      if (editingProject) {
        await updateProject(editingProject.id, {
          name,
          leadId: leadId || null,
          description: description || null,
          status,
          startDate: startDate || null,
          targetDate: targetDate || null,
          projectManagerId: projectManagerId || null,
        });
        addToast(`Updated project "${name}"`, "success");
      } else {
        await createProject({
          name,
          leadId: leadId || undefined,
          description: description || undefined,
          status,
          startDate: startDate || undefined,
          targetDate: targetDate || undefined,
          projectManagerId: projectManagerId || undefined,
        });
        addToast(`Created project "${name}"`, "success");
      }

      setIsModalOpen(false);
      resetForm();
      window.location.reload();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save project";
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (p: ProjectItem) => {
    if (!confirm(`Are you sure you want to delete project "${p.name}"?`)) return;

    try {
      await deleteProject(p.id);
      addToast(`Deleted project "${p.name}"`, "success");
      setProjects((prev) => prev.filter((item) => item.id !== p.id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete project";
      addToast(msg, "error");
    }
  };

  const getStatusBadgeVariant = (st: ProjectStatus) => {
    switch (st) {
      case "ACTIVE":
      case "IN_PROGRESS":
        return "success";
      case "COMPLETED":
        return "secondary";
      case "ON_HOLD":
        return "warning";
      case "CANCELLED":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Projects</div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {activeProjects.length}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">In Execution Phase</div>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Planned Projects</div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
            {plannedProjects.length}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Initialization Stage</div>
        </Card>

        <Card className="p-4 border-l-4 border-l-primary">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Completed</div>
          <div className="text-2xl font-extrabold text-foreground mt-1">{completedProjects.length}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Delivered Projects</div>
        </Card>

        <Card className="p-4 border-l-4 border-l-indigo-500">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Portfolio</div>
          <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
            {filteredProjects.length}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Tracked Projects</div>
        </Card>
      </div>

      {/* Controls Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search project name, client company, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="w-48">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "ALL", label: "All Project Statuses" },
                { value: "PLANNED", label: "Planned" },
                { value: "ACTIVE", label: "Active" },
                { value: "ON_HOLD", label: "On Hold" },
                { value: "COMPLETED", label: "Completed" },
                { value: "CANCELLED", label: "Cancelled" },
              ]}
            />
          </div>
        </div>

        <Button size="sm" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-1.5" /> Initialize Project
        </Button>
      </div>

      {/* Projects List Grid */}
      <Card>
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-primary" />
            Client Projects Portfolio ({filteredProjects.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12 text-xs text-muted-foreground space-y-2">
              <FolderKanban className="w-8 h-8 mx-auto text-muted-foreground/60" />
              <p className="font-semibold text-foreground">No projects found</p>
              <p>Initialize a project or convert a won sales opportunity.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="p-5 rounded-xl border border-border bg-card space-y-4 hover:border-primary/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm text-foreground">{project.name}</h3>
                        <Badge variant={getStatusBadgeVariant(project.status)} className="text-[10px] px-2">
                          {project.status.replace("_", " ")}
                        </Badge>
                      </div>

                      {project.lead && (
                        <Link
                          href={`/leads/${project.lead.id}`}
                          className="text-xs text-muted-foreground hover:text-primary font-medium flex items-center gap-1.5 mt-1 truncate"
                        >
                          <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="truncate">{project.lead.company}</span>
                        </Link>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(project)}
                        className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded"
                        title="Edit Project"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(project)}
                        className="p-1 text-muted-foreground hover:text-red-600 transition-colors rounded"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {project.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 p-2.5 rounded border border-border/40 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  {project.opportunity && (
                    <div className="p-2 rounded bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 text-[11px] text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                      <span>Converted from Opportunity: <strong>{project.opportunity.name}</strong> (${(project.opportunity.value || 0).toLocaleString()})</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                    <div className="flex items-center gap-3">
                      {project.startDate && (
                        <span className="flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-primary" /> Start: {new Date(project.startDate).toLocaleDateString()}
                        </span>
                      )}

                      {project.targetDate && (
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-amber-500" /> Target: {new Date(project.targetDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" /> PM: {project.projectManager?.name || project.projectManager?.email || "Unassigned"}
                      </span>

                      <span className="flex items-center gap-1 font-medium bg-muted px-2 py-0.5 rounded text-[10px]">
                        <Users className="w-3 h-3" /> {project.members?.length || 1} Members
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Project Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? "Edit Project Details" : "Initialize New Client Project"}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input
            label="Project Name *"
            placeholder="e.g. POS Portal Full-Stack Deployment"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Select
            label="Associated Client / Company"
            value={leadId}
            onChange={(e) => setLeadId(e.target.value)}
            options={[
              { value: "", label: "Unlinked Client (Internal Project)" },
              ...leads.map((l) => ({ value: l.id, label: l.company })),
            ]}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Status *"
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              options={[
                { value: "PLANNED", label: "Planned" },
                { value: "ACTIVE", label: "Active" },
                { value: "ON_HOLD", label: "On Hold" },
                { value: "COMPLETED", label: "Completed" },
                { value: "CANCELLED", label: "Cancelled" },
              ]}
            />

            <Select
              label="Project Manager"
              value={projectManagerId}
              onChange={(e) => setProjectManagerId(e.target.value)}
              options={users.map((u) => ({ value: u.id, label: u.name || u.email }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DateInput
              label="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <DateInput
              label="Target Completion Date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Project Description & Scope</label>
            <textarea
              className="w-full min-h-[70px] p-2.5 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Outline project deliverables, tech stack requirements, or team responsibilities..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {editingProject ? "Save Changes" : "Create Project"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
