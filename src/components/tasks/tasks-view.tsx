"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DateInput } from "@/components/ui/date-input";
import { Badge, getPriorityBadgeVariant } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { createTask, updateTask, toggleTaskComplete } from "@/lib/actions/task-actions";
import { Priority, TaskStatus } from "@prisma/client";
import {
  CheckSquare,
  Plus,
  User,
  Building2,
  CheckCircle2,
  Circle,
  Search,
  Edit3,
  AlertCircle,
  Calendar,
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

interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate: Date | string | null;
  leadId: string | null;
  assignedUserId: string | null;
  createdAt: Date | string;
  lead?: {
    id: string;
    company: string;
    domain: string | null;
  } | null;
  assignedUser?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

interface TasksViewProps {
  initialTasks: TaskItem[];
  leads: LeadOption[];
  users: UserOption[];
}

export function TasksView({ initialTasks, leads, users }: TasksViewProps) {
  const [tasks, setTasks] = React.useState<TaskItem[]>(initialTasks);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = React.useState<string>("ALL");
  const [leadFilter, setLeadFilter] = React.useState<string>("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<TaskItem | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Form State
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [status, setStatus] = React.useState<TaskStatus>(TaskStatus.TODO);
  const [priority, setPriority] = React.useState<Priority>(Priority.MEDIUM);
  const [dueDate, setDueDate] = React.useState("");
  const [leadId, setLeadId] = React.useState("");
  const [assignedUserId, setAssignedUserId] = React.useState("");

  const { addToast } = useToast();

  const filteredTasks = tasks.filter((t) => {
    const isCompleted = t.status === TaskStatus.COMPLETED;
    const isOverdue = t.dueDate && new Date(t.dueDate) < new Date() && !isCompleted;

    let matchesStatus = true;
    if (statusFilter === "OVERDUE") {
      matchesStatus = Boolean(isOverdue);
    } else if (statusFilter !== "ALL") {
      matchesStatus = t.status === statusFilter;
    }

    const matchesPriority = priorityFilter === "ALL" || t.priority === priorityFilter;
    const matchesLead = leadFilter === "ALL" || t.leadId === leadFilter;

    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      t.title.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q)) ||
      (t.lead && t.lead.company.toLowerCase().includes(q));

    return matchesStatus && matchesPriority && matchesLead && matchesSearch;
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStatus(TaskStatus.TODO);
    setPriority(Priority.MEDIUM);
    setDueDate("");
    setLeadId("");
    setAssignedUserId(users[0]?.id || "");
    setEditingTask(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task: TaskItem) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || "");
    setStatus(task.status);
    setPriority(task.priority);
    setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().substring(0, 10) : "");
    setLeadId(task.leadId || "");
    setAssignedUserId(task.assignedUserId || "");
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast("Task title is required.", "error");
      return;
    }

    setLoading(true);
    try {
      if (editingTask) {
        await updateTask(editingTask.id, {
          title,
          description,
          status,
          priority,
          dueDate: dueDate || null,
          leadId: leadId || null,
          assignedUserId: assignedUserId || null,
        });
        addToast(`Updated task "${title}"`, "success");
      } else {
        await createTask({
          title,
          description,
          status,
          priority,
          dueDate: dueDate || undefined,
          leadId: leadId || undefined,
          assignedUserId: assignedUserId || undefined,
        });
        addToast(`Created task "${title}"`, "success");
      }

      setIsModalOpen(false);
      resetForm();
      window.location.reload();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save task";
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (taskId: string) => {
    try {
      const updated = await toggleTaskComplete(taskId);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: updated.status } : t))
      );
      addToast(`Task status set to ${updated.status}`, "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update task status";
      addToast(msg, "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full lg:w-auto flex-1">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search task title, company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: "ALL", label: "All Statuses" },
              { value: "TODO", label: "To Do (Pending)" },
              { value: "IN_PROGRESS", label: "In Progress" },
              { value: "OVERDUE", label: "Overdue Only" },
              { value: "COMPLETED", label: "Completed" },
            ]}
          />

          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            options={[
              { value: "ALL", label: "All Priorities" },
              { value: Priority.LOW, label: "Low Priority" },
              { value: Priority.MEDIUM, label: "Medium Priority" },
              { value: Priority.HIGH, label: "High Priority" },
              { value: Priority.URGENT, label: "Urgent Priority" },
            ]}
          />

          <Select
            value={leadFilter}
            onChange={(e) => setLeadFilter(e.target.value)}
            options={[
              { value: "ALL", label: "All Companies" },
              ...leads.map((l) => ({ value: l.id, label: l.company })),
            ]}
          />
        </div>

        <Button size="sm" onClick={handleOpenCreate} className="shrink-0">
          <Plus className="w-4 h-4 mr-1.5" /> Create Task
        </Button>
      </div>

      {/* Task Cards List */}
      <Card>
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-primary" />
            Assigned Tasks &amp; Operational Action Items ({filteredTasks.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 text-xs text-muted-foreground space-y-2">
              <CheckSquare className="w-8 h-8 mx-auto text-muted-foreground/60" />
              <p className="font-semibold text-foreground">No tasks matching filters</p>
              <p>Create a task or adjust your search filters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((t) => {
                const isCompleted = t.status === TaskStatus.COMPLETED;
                const isOverdue = t.dueDate && new Date(t.dueDate) < new Date() && !isCompleted;

                return (
                  <div
                    key={t.id}
                    className={`p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                      isCompleted
                        ? "bg-muted/20 border-border opacity-75"
                        : isOverdue
                        ? "bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900/60"
                        : "bg-card border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleComplete(t.id)}
                        className="mt-0.5 text-muted-foreground hover:text-primary transition-colors focus:outline-none cursor-pointer shrink-0"
                        title={isCompleted ? "Mark Incomplete" : "Mark Complete"}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`font-bold text-sm ${
                              isCompleted ? "line-through text-muted-foreground" : "text-foreground"
                            }`}
                          >
                            {t.title}
                          </span>

                          <Badge variant={getPriorityBadgeVariant(t.priority)} className="text-[10px]">
                            {t.priority}
                          </Badge>

                          {isOverdue && (
                            <Badge variant="destructive" className="text-[10px] flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> OVERDUE
                            </Badge>
                          )}

                          {t.status === TaskStatus.IN_PROGRESS && (
                            <Badge variant="secondary" className="text-[10px]">IN PROGRESS</Badge>
                          )}
                        </div>

                        {t.description && (
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {t.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground pt-1">
                          {t.lead && (
                            <Link href={`/leads/${t.lead.id}`} className="hover:text-primary font-medium flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-primary" />
                              <span>{t.lead.company}</span>
                            </Link>
                          )}

                          {t.dueDate && (
                            <span className={`flex items-center gap-1 font-medium ${isOverdue ? "text-red-600 dark:text-red-400 font-bold" : ""}`}>
                              <Calendar className="w-3.5 h-3.5" />
                              {isOverdue ? "Overdue: " : "Due: "}
                              {new Date(t.dueDate).toLocaleDateString()}
                            </span>
                          )}

                          {t.assignedUser && (
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" /> Assigned: {t.assignedUser.name || t.assignedUser.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 shrink-0 self-end sm:self-center" onClick={() => handleOpenEdit(t)}>
                      <Edit3 className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Task Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? "Edit Operational Task" : "Create New Operational Task"}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input
            label="Task Title *"
            placeholder="e.g. Schedule discovery call with VP of Engineering"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Task Details & Deliverables</label>
            <textarea
              className="w-full min-h-[80px] p-2.5 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Outline task objectives, key topics, or specific instructions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              options={[
                { value: TaskStatus.TODO, label: "To Do (Pending)" },
                { value: TaskStatus.IN_PROGRESS, label: "In Progress" },
                { value: TaskStatus.COMPLETED, label: "Completed" },
              ]}
            />

            <Select
              label="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              options={[
                { value: Priority.LOW, label: "Low" },
                { value: Priority.MEDIUM, label: "Medium" },
                { value: Priority.HIGH, label: "High" },
                { value: Priority.URGENT, label: "Urgent" },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DateInput
              label="Due Date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />

            <Select
              label="Assigned User"
              value={assignedUserId}
              onChange={(e) => setAssignedUserId(e.target.value)}
              options={users.map((u) => ({ value: u.id, label: u.name || u.email }))}
            />
          </div>

          <Select
            label="Associated Company / Lead"
            value={leadId}
            onChange={(e) => setLeadId(e.target.value)}
            options={[
              { value: "", label: "Unlinked Task (No Lead)" },
              ...leads.map((l) => ({ value: l.id, label: l.company })),
            ]}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {editingTask ? "Save Task" : "Create Task"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
