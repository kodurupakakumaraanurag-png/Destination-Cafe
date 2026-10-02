"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { addLeadActivity } from "@/lib/actions/lead-actions";
import { Activity as ActivityIcon, Phone, Mail, Share2, Users, FileText, Settings, Plus, Clock, Sliders } from "lucide-react";
import { LeadDetailRecord, LeadActivity } from "@/types/lead-detail";
import { ActivityType } from "@prisma/client";

interface ActivityTabProps {
  lead: LeadDetailRecord;
}

export function ActivityTab({ lead }: ActivityTabProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [type, setType] = React.useState<ActivityType>(ActivityType.CALL);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const { addToast } = useToast();

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await addLeadActivity(lead.id, {
        type,
        title,
        description: description || undefined,
      });
      addToast("Activity logged successfully", "success");
      setIsModalOpen(false);
      setTitle("");
      setDescription("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to log activity";
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (actType: string) => {
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b border-border pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ActivityIcon className="w-4 h-4 text-primary" />
            Activity Timeline ({lead.activities?.length || 0})
          </CardTitle>
          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> Log Activity
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          {lead.activities && lead.activities.length > 0 ? (
            <div className="relative border-l border-border ml-4 space-y-6 pl-6">
              {lead.activities.map((act: LeadActivity) => (
                <div key={act.id} className="relative group">
                  {/* Timeline Node Bullet */}
                  <div className="absolute -left-[31px] top-0.5 w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center shadow-xs">
                    {getActivityIcon(act.type)}
                  </div>

                  <div className="p-4 rounded-lg bg-card border border-border shadow-2xs space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">{act.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-muted text-muted-foreground">
                          {act.type}
                        </span>
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

                    <div className="text-[10px] text-muted-foreground pt-1 border-t border-border/50">
                      Logged by: <span className="font-medium text-foreground">{act.user?.name || act.user?.email || "System"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground text-xs">
              No activity logs recorded for this lead yet. Click &quot;Log Activity&quot; to add notes or call records.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Activity Modal */}
      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log New Activity" maxWidth="max-w-md">
        <form onSubmit={handleAddActivity} className="space-y-4">
          <Select
            label="Activity Type"
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
            placeholder="e.g. Discovery Call with CTO"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Details / Description</label>
            <textarea
              className="w-full min-h-[100px] p-2.5 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Record notes, key discussion points, or next steps..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Log Activity
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
