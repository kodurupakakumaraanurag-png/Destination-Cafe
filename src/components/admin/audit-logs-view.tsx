"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Search,
  User,
  Clock,
} from "lucide-react";

interface AuditUser {
  id: string;
  name: string | null;
  email: string;
  userRole: string;
}

interface AuditLogItem {
  id: string;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  details: string | null;
  createdAt: Date | string;
  user?: AuditUser | null;
}

interface UserOption {
  id: string;
  name: string | null;
  email: string;
}

interface AuditLogsViewProps {
  initialLogs: AuditLogItem[];
  totalCount: number;
  distinctActions: string[];
  distinctEntities: string[];
  users: UserOption[];
}

export function AuditLogsView({
  initialLogs,
  totalCount,
  distinctActions,
  distinctEntities,
  users,
}: AuditLogsViewProps) {
  const [logs] = React.useState<AuditLogItem[]>(initialLogs);
  const [search, setSearch] = React.useState("");
  const [selectedUser, setSelectedUser] = React.useState("ALL");
  const [selectedAction, setSelectedAction] = React.useState("ALL");
  const [selectedEntity, setSelectedEntity] = React.useState("ALL");

  const filteredLogs = logs.filter((log) => {
    const matchesUser = selectedUser === "ALL" || log.userId === selectedUser;
    const matchesAction = selectedAction === "ALL" || log.action === selectedAction;
    const matchesEntity = selectedEntity === "ALL" || log.entity === selectedEntity;

    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      log.action.toLowerCase().includes(q) ||
      log.entity.toLowerCase().includes(q) ||
      (log.entityId && log.entityId.toLowerCase().includes(q)) ||
      (log.details && log.details.toLowerCase().includes(q)) ||
      (log.user && ((log.user.name && log.user.name.toLowerCase().includes(q)) || log.user.email.toLowerCase().includes(q)));

    return matchesUser && matchesAction && matchesEntity && matchesSearch;
  });

  const getActionBadgeVariant = (act: string) => {
    if (act.includes("CREATE") || act.includes("IMPORT") || act.includes("CONVERT")) return "success";
    if (act.includes("DELETE") || act.includes("ARCHIVE")) return "destructive";
    if (act.includes("EDIT") || act.includes("UPDATE")) return "secondary";
    return "outline";
  };

  return (
    <div className="space-y-6">
      {/* Controls Header & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search action, entity ID, details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <Select
          value={selectedAction}
          onChange={(e) => setSelectedAction(e.target.value)}
          options={[
            { value: "ALL", label: "All Logged Actions" },
            ...distinctActions.map((a) => ({ value: a, label: a })),
          ]}
        />

        <Select
          value={selectedEntity}
          onChange={(e) => setSelectedEntity(e.target.value)}
          options={[
            { value: "ALL", label: "All Target Entities" },
            ...distinctEntities.map((e) => ({ value: e, label: e })),
          ]}
        />

        <Select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          options={[
            { value: "ALL", label: "All Initiating Users" },
            ...users.map((u) => ({ value: u.id, label: u.name || u.email })),
          ]}
        />
      </div>

      {/* Audit Log Table */}
      <Card>
        <CardHeader className="border-b border-border pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Security &amp; System Audit Log Trail ({filteredLogs.length} / {totalCount})
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">
            Server Authorized Check Active
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-xs text-muted-foreground space-y-2">
              <FileText className="w-8 h-8 mx-auto text-muted-foreground/60" />
              <p className="font-semibold text-foreground">No audit logs matching filters</p>
              <p>Try clearing action, user, or entity filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 border-b border-border font-semibold text-muted-foreground text-[11px]">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">User / Actor</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Entity</th>
                    <th className="p-3">Entity ID</th>
                    <th className="p-3">Details &amp; Audit Trail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 text-muted-foreground font-mono text-[11px] whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-muted-foreground shrink-0" />
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </td>

                      <td className="p-3 font-medium text-foreground">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-primary shrink-0" />
                          <div>
                            <div className="font-bold">{log.user?.name || log.user?.email || "System Engine"}</div>
                            {log.user?.userRole && (
                              <span className="text-[10px] text-muted-foreground">{log.user.userRole}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-3">
                        <Badge variant={getActionBadgeVariant(log.action)} className="text-[10px] uppercase font-mono">
                          {log.action}
                        </Badge>
                      </td>

                      <td className="p-3 font-semibold text-foreground">{log.entity}</td>

                      <td className="p-3 font-mono text-[11px] text-muted-foreground">
                        {log.entityId ? <span className="px-1.5 py-0.5 rounded bg-muted">{log.entityId}</span> : "—"}
                      </td>

                      <td className="p-3 text-muted-foreground leading-relaxed max-w-md">
                        {log.details || "No additional detail recorded"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
