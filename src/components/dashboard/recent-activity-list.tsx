import { ActivityItem } from "@/lib/data/dashboard-data";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Activity, PhoneCall, Mail, Calendar, Cpu } from "lucide-react";

export function RecentActivityList({ activities }: { activities: ActivityItem[] }) {
  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest CRM system interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<Activity className="w-6 h-6 text-muted-foreground" />}
            title="No Recent Activity"
            description="System activity logs will appear here as team members interact with leads."
          />
        </CardContent>
      </Card>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "CALL":
        return <PhoneCall className="w-3.5 h-3.5 text-blue-500" />;
      case "EMAIL":
        return <Mail className="w-3.5 h-3.5 text-purple-500" />;
      case "MEETING":
        return <Calendar className="w-3.5 h-3.5 text-emerald-500" />;
      case "SYSTEM_EVENT":
      default:
        return <Cpu className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <span>Recent Activity</span>
        </CardTitle>
        <CardDescription className="text-xs">
          Real-time system events, calls, and updates.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {activities.map((act) => (
          <div key={act.id} className="flex items-start gap-3 text-xs border-b border-border/50 pb-3 last:border-0 last:pb-0">
            <div className="p-1.5 rounded-full bg-secondary border border-border mt-0.5">
              {getTypeIcon(act.type)}
            </div>
            <div className="flex-1 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">{act.title}</span>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(act.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
              {act.description && <p className="text-[11px] text-muted-foreground line-clamp-1">{act.description}</p>}
              {act.userEmail && <p className="text-[10px] text-primary/80 font-mono">{act.userEmail}</p>}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
