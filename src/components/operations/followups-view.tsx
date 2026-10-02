"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, getPriorityBadgeVariant } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { toggleTaskComplete } from "@/lib/actions/task-actions";
import { FollowUpItem } from "@/lib/actions/followup-actions";
import { Priority } from "@prisma/client";
import {
  Clock,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Circle,
  Building2,
  ArrowRight,
  User,
  CheckSquare,
} from "lucide-react";

interface FollowUpsViewProps {
  today: FollowUpItem[];
  upcoming: FollowUpItem[];
  overdue: FollowUpItem[];
  leadsWithNextAction: Array<{
    id: string;
    company: string;
    domain: string | null;
    nextAction: string | null;
    priority: Priority;
    assignedUser?: { name: string | null; email: string } | null;
  }>;
}

export function FollowUpsView({
  today: initialToday,
  upcoming: initialUpcoming,
  overdue: initialOverdue,
  leadsWithNextAction,
}: FollowUpsViewProps) {
  const [today, setToday] = React.useState<FollowUpItem[]>(initialToday);
  const [upcoming, setUpcoming] = React.useState<FollowUpItem[]>(initialUpcoming);
  const [overdue, setOverdue] = React.useState<FollowUpItem[]>(initialOverdue);

  const { addToast } = useToast();

  const handleComplete = async (taskId: string) => {
    try {
      await toggleTaskComplete(taskId);
      addToast("Follow-up task marked as complete!", "success");

      setToday((prev) => prev.filter((t) => t.id !== taskId));
      setUpcoming((prev) => prev.filter((t) => t.id !== taskId));
      setOverdue((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update follow-up";
      addToast(msg, "error");
    }
  };

  return (
    <div className="space-y-8">
      {/* 3 Metric Cards Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-red-500 bg-red-50/20 dark:bg-red-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-700 dark:text-red-300 uppercase tracking-wider">
              Overdue Follow-ups
            </span>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-3xl font-extrabold text-red-600 dark:text-red-400 mt-2">{overdue.length}</div>
          <div className="text-[11px] text-muted-foreground mt-1">Requires immediate client outreach</div>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500 bg-amber-50/20 dark:bg-amber-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
              Today&apos;s Schedule
            </span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">{today.length}</div>
          <div className="text-[11px] text-muted-foreground mt-1">Scheduled for action today</div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
              Upcoming Follow-ups
            </span>
            <Calendar className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">{upcoming.length}</div>
          <div className="text-[11px] text-muted-foreground mt-1">Scheduled for upcoming days</div>
        </Card>
      </div>

      {/* SECTION 1: OVERDUE FOLLOW-UPS */}
      <Card>
        <CardHeader className="border-b border-border pb-3 bg-red-50/30 dark:bg-red-950/20">
          <CardTitle className="text-sm font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            Overdue Follow-ups ({overdue.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {overdue.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Great job! No overdue follow-up tasks currently pending.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {overdue.map((item) => (
                <FollowUpCard key={item.id} item={item} onComplete={handleComplete} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* SECTION 2: TODAY'S FOLLOW-UPS */}
      <Card>
        <CardHeader className="border-b border-border pb-3 bg-amber-50/30 dark:bg-amber-950/20">
          <CardTitle className="text-sm font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            Today&apos;s Follow-ups ({today.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {today.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground">
              No follow-up tasks scheduled specifically for today.
            </div>
          ) : (
            <div className="space-y-3">
              {today.map((item) => (
                <FollowUpCard key={item.id} item={item} onComplete={handleComplete} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* SECTION 3: UPCOMING FOLLOW-UPS */}
      <Card>
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Upcoming Follow-ups ({upcoming.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {upcoming.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground">
              No upcoming future follow-ups recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((item) => (
                <FollowUpCard key={item.id} item={item} onComplete={handleComplete} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* SECTION 4: LEADS WITH PLANNED NEXT ACTIONS */}
      <Card>
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-primary" />
            CRM Leads with Specified Next Actions ({leadsWithNextAction.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {leadsWithNextAction.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground">
              No leads with specific Next Action statements recorded.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {leadsWithNextAction.map((lead) => (
                <div key={lead.id} className="p-3.5 rounded-lg border border-border bg-card space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <Link href={`/leads/${lead.id}`} className="font-bold text-foreground hover:text-primary flex items-center gap-1.5 truncate">
                      <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">{lead.company}</span>
                    </Link>
                    <Badge variant={getPriorityBadgeVariant(lead.priority)} className="text-[10px]">
                      {lead.priority}
                    </Badge>
                  </div>

                  <p className="text-muted-foreground leading-snug bg-muted/30 p-2 rounded border border-border/40">
                    <strong className="text-foreground">Next Action:</strong> {lead.nextAction}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                    <span>{lead.assignedUser?.name || lead.assignedUser?.email || "Unassigned"}</span>
                    <Link href={`/leads/${lead.id}`} className="text-primary hover:underline font-semibold flex items-center gap-1">
                      View Dossier <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FollowUpCard({
  item,
  onComplete,
}: {
  item: FollowUpItem;
  onComplete: (id: string) => void;
}) {
  return (
    <div
      className={`p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
        item.isOverdue
          ? "bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/60"
          : item.isToday
          ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60"
          : "bg-card border-border"
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => onComplete(item.id)}
          className="mt-0.5 text-muted-foreground hover:text-primary transition-colors focus:outline-none cursor-pointer shrink-0"
          title="Mark Complete"
        >
          <Circle className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm text-foreground">{item.title}</span>
            <Badge variant={getPriorityBadgeVariant(item.priority)} className="text-[10px]">
              {item.priority}
            </Badge>
            {item.isOverdue && (
              <Badge variant="destructive" className="text-[10px]">OVERDUE</Badge>
            )}
            {item.isToday && (
              <Badge variant="warning" className="text-[10px]">TODAY</Badge>
            )}
          </div>

          {item.description && (
            <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground pt-1">
            {item.leadCompany && item.leadId && (
              <Link href={`/leads/${item.leadId}`} className="hover:text-primary font-medium flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-primary" />
                <span>{item.leadCompany}</span>
              </Link>
            )}

            <span className={`flex items-center gap-1 font-medium ${item.isOverdue ? "text-red-600 dark:text-red-400 font-bold" : ""}`}>
              <Clock className="w-3.5 h-3.5" />
              {item.isOverdue ? "Overdue: " : "Due: "}
              {new Date(item.dueDate).toLocaleDateString()}
            </span>

            {item.assignedUserName && (
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Assigned: {item.assignedUserName}
              </span>
            )}
          </div>
        </div>
      </div>

      <Button size="sm" variant="outline" onClick={() => onComplete(item.id)} className="shrink-0 text-xs">
        <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Complete
      </Button>
    </div>
  );
}
