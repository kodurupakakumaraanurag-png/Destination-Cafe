import { TaskItem } from "@/lib/data/dashboard-data";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { CheckSquare, Clock } from "lucide-react";

export function UpcomingTasksList({ tasks }: { tasks: TaskItem[] }) {
  if (!tasks || tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Tasks</CardTitle>
          <CardDescription>Scheduled operational action items</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<CheckSquare className="w-6 h-6 text-muted-foreground" />}
            title="No Pending Tasks"
            description="Assigned tasks and follow-up items will appear here."
          />
        </CardContent>
      </Card>
    );
  }

  const priorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "destructive";
      case "HIGH":
        return "warning";
      case "MEDIUM":
        return "default";
      case "LOW":
      default:
        return "secondary";
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-primary" />
          <span>Upcoming &amp; Overdue Tasks</span>
        </CardTitle>
        <CardDescription className="text-xs">
          Action items assigned across sales and operations.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`p-3 rounded-lg border text-xs space-y-1.5 transition-colors ${
              task.isOverdue
                ? "bg-red-500/5 border-red-500/30"
                : "bg-secondary/40 border-border"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-foreground truncate">{task.title}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                {task.isOverdue && (
                  <Badge variant="destructive" className="text-[9px] px-1.5 py-0">
                    Overdue
                  </Badge>
                )}
                <Badge variant={priorityBadgeVariant(task.priority)} className="text-[9px]">
                  {task.priority}
                </Badge>
              </div>
            </div>

            {task.description && (
              <p className="text-[11px] text-muted-foreground line-clamp-1">{task.description}</p>
            )}

            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
              <span className="truncate">{task.companyName || "General Task"}</span>
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3" />
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No Date"}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
