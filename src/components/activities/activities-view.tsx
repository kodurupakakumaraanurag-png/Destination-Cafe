"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { createActivity } from "@/lib/actions/activity-actions";
import { ActivityType } from "@prisma/client";
import {
  Activity as ActivityIcon,
  Phone,
  Mail,
  Share2,
  Users,
  FileText,
  Clock,
  Plus,
  Search,
  Building2,
  Sliders,
  Settings,
} from "lucide-react";

interface LeadOption {
  id: string;
  company: string;
}

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string | null;
  createdAt: Date | string;
  lead?: {
    id: string;
    company: string;
    domain: string | null;
  } | null;
  user?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

interface ActivitiesViewProps {
  initialActivities: ActivityItem[];
  leads: LeadOption[];
}

export function ActivitiesView({ initialActivities, leads }: ActivitiesViewProps) {
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [leadId, setLeadId] = React.useState("");
  const [type, setType] = React.useState<ActivityType>(ActivityType.CALL);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const { addToast } = useToast();

  const filteredActivities = initialActivities.filter((act) => {
    const matchesType = typeFilter === "ALL" || act.type === typeFilter;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      act.title.toLowerCase().includes(q) ||
      (act.description && act.description.toLowerCase().includes(q)) ||
      (act.lead && act.lead.company.toLowerCase().includes(q));

    return matchesType && matchesSearch;
  });

  const getActivityIcon = (actType: ActivityType) => {
    switch (actType) {
      case "CALL":
        return <Phone className="w-4 h-4 text-blue-500" />;
      case "EMAIL":
        return <Mail className="w-4 h-4 text-purple-500" />;
      case "LINKEDIN":
        return <Share2 className="w-4 h-4 text-sky-600" />;
      case "MEETING":
        return <Users className="w-4 h-4 text-emerald-500" />;
      case "NOTE":
        return <FileText className="w-4 h-4 text-amber-500" />;
      case "FOLLOW_UP":
        return <Clock className="w-4 h-4 text-indigo-500" />;
      case "STATUS_CHANGE":
        return <Sliders className="w-4 h-4 text-rose-500" />;
      default:
        return <Settings className="w-4 h-4 text-slate-500" />;
    }
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast("Activity title is required.", "error");
      return;
    }

    setLoading(true);
    try {
      await createActivity({
        leadId: leadId || undefined,
        type,
        title,
        description: description || undefined,
      });

      addToast("Activity logged successfully!", "success");
      setIsModalOpen(false);
      setTitle("");
      setDescription("");
      setLeadId("");
      window.location.reload();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to log activity";
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Header Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search timeline activities or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="w-48">
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { value: "ALL", label: "All Activity Types" },
                { value: "CALL", label: "Phone Call" },
                { value: "EMAIL", label: "Email Interaction" },
                { value: "LINKEDIN", label: "LinkedIn Outreach" },
                { value: "MEETING", label: "Client Meeting" },
                { value: "NOTE", label: "General Note" },
                { value: "FOLLOW_UP", label: "Follow-up Task" },
                { value: "STATUS_CHANGE", label: "Status Change" },
              ]}
            />
          </div>
        </div>

        <Button size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Log Activity
        </Button>
      </div>

      {/* Activity Timeline Card */}
      <Card>
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ActivityIcon className="w-4 h-4 text-primary" />
            Global Activity Audit Stream ({filteredActivities.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-12 text-xs text-muted-foreground space-y-2">
              <ActivityIcon className="w-8 h-8 mx-auto text-muted-foreground/60" />
              <p className="font-semibold text-foreground">No activities recorded</p>
              <p>Log client calls, meetings, or emails to maintain interaction history.</p>
            </div>
          ) : (
            <div className="relative border-l border-border ml-4 space-y-6 pl-6">
              {filteredActivities.map((act) => (
                <div key={act.id} className="relative group">
                  {/* Timeline Node Bullet */}
                  <div className="absolute -left-[31px] top-0.5 w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center shadow-xs">
                    {getActivityIcon(act.type)}
                  </div>

                  <div className="p-4 rounded-lg bg-card border border-border shadow-2xs space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-foreground">{act.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-primary/10 text-primary uppercase">
                          {act.type.replace("_", " ")}
                        </span>
                        {act.lead && (
                          <Link href={`/leads/${act.lead.id}`} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-muted-foreground" />
                            <span className="font-semibold">{act.lead.company}</span>
                          </Link>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(act.createdAt).toLocaleString()}
                      </div>
                    </div>

                    {act.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {act.description}
                      </p>
                    )}

                    <div className="text-[10px] text-muted-foreground pt-2 border-t border-border/50 flex items-center justify-between">
                      <span>Logged by: <strong className="text-foreground">{act.user?.name || act.user?.email || "System"}</strong></span>
                      {act.lead && <span className="font-mono text-[9px]">Lead ID: {act.lead.id}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Activity Modal */}
      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Client Activity" maxWidth="max-w-md">
        <form onSubmit={handleCreateActivity} className="space-y-4">
          <Select
            label="Associated Company / Lead"
            value={leadId}
            onChange={(e) => setLeadId(e.target.value)}
            options={[
              { value: "", label: "General System Event (Unlinked)" },
              ...leads.map((l) => ({ value: l.id, label: l.company })),
            ]}
          />

          <Select
            label="Activity Type *"
            value={type}
            onChange={(e) => setType(e.target.value as ActivityType)}
            options={[
              { value: "CALL", label: "Phone Call" },
              { value: "EMAIL", label: "Email Interaction" },
              { value: "LINKEDIN", label: "LinkedIn Outreach" },
              { value: "MEETING", label: "Client Meeting" },
              { value: "NOTE", label: "General Note" },
              { value: "FOLLOW_UP", label: "Follow-up Action" },
              { value: "STATUS_CHANGE", label: "Status Change" },
            ]}
          />

          <Input
            label="Activity Title *"
            placeholder="e.g. Solution pitch call with Managing Director"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Interaction Notes & Discussion Details</label>
            <textarea
              className="w-full min-h-[90px] p-2.5 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Record summary, client pain points, or agreed next steps..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Save Activity Log
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
