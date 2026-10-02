"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DateInput } from "@/components/ui/date-input";
import { Dialog } from "@/components/ui/dialog";
import { Badge, getPriorityBadgeVariant } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { addLeadTask, toggleTaskStatus } from "@/lib/actions/lead-actions";
import { CheckSquare, Plus, Clock, User, CheckCircle2, Circle } from "lucide-react";
import { Priority, TaskStatus } from "@prisma/client";
import { LeadDetailRecord, LeadTask } from "@/types/lead-detail";

interface TasksTabProps {
  lead: LeadDetailRecord;
}

export function TasksTab({ lead }: TasksTabProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [priority, setPriority] = React.useState<Priority>(Priority.MEDIUM);
  const [dueDate, setDueDate] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const { addToast } = useToast();

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await addLeadTask(lead.id, {
        title,
        description: description || undefined,
        priority,
        dueDate: dueDate || undefined,
      });
      addToast("Task created successfully", "success");
      setIsModalOpen(false);
      setTitle("");
      setDescription("");
      setDueDate("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create task";
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (taskId: string, currentStatus: TaskStatus) => {
    try {
      await toggleTaskStatus(taskId, currentStatus, lead.id);
      addToast("Task status updated", "success");
    } catch {
      addToast("Failed to update task", "error");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b border-border pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-primary" />
            Lead Tasks & Follow-ups ({lead.tasks?.length || 0})
          </CardTitle>
          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add Task
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          {lead.tasks && lead.tasks.length > 0 ? (
            <div className="space-y-3">
              {lead.tasks.map((task: LeadTask) => {
                const isCompleted = task.status === "COMPLETED";
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted;

                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-lg border flex items-start justify-between gap-4 transition-colors ${
                      isCompleted
                        ? "bg-muted/30 border-border opacity-70"
                        : isOverdue
                        ? "bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                        : "bg-card border-border"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleStatus(task.id, task.status)}
                        className="mt-0.5 text-muted-foreground hover:text-primary transition-colors focus:outline-none cursor-pointer"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>
                      <div>
                        <div className={`font-semibold text-sm ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
                          {task.title}
                        </div>
                        {task.description && (
                          <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground mt-2">
                          {task.dueDate && (
                            <span className={`flex items-center gap-1 font-medium ${isOverdue ? "text-red-600 font-bold" : ""}`}>
                              <Clock className="w-3 h-3" />
                              {isOverdue ? "Overdue: " : "Due: "}
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                          {task.assignedUser && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" /> Assigned to {task.assignedUser.name || task.assignedUser.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={getPriorityBadgeVariant(task.priority)} className="text-[10px]">
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground text-xs">
              No tasks assigned to this lead. Click &quot;Add Task&quot; to assign follow-up items.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Task Modal */}
      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Lead Task" maxWidth="max-w-md">
        <form onSubmit={handleAddTask} className="space-y-4">
          <Input
            label="Task Title *"
            placeholder="e.g. Draft custom CRM solution proposal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Description</label>
            <textarea
              className="w-full min-h-[80px] p-2.5 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Add task details, notes, or specific deliverables..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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

            <DateInput
              label="Due Date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Create Task
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
