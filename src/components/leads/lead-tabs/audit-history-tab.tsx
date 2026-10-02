"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, User, Clock } from "lucide-react";
import { LeadAuditLog } from "@/types/lead-detail";

interface AuditHistoryTabProps {
  auditLogs: LeadAuditLog[];
}

export function AuditHistoryTab({ auditLogs }: AuditHistoryTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Immutable Audit Trail ({auditLogs?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {auditLogs && auditLogs.length > 0 ? (
            <div className="space-y-3">
              {auditLogs.map((log: LeadAuditLog) => (
                <div key={log.id} className="p-4 rounded-lg bg-card border border-border space-y-1.5 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-foreground px-2 py-0.5 rounded bg-primary/10 text-primary">
                        {log.action}
                      </span>
                      <span className="text-muted-foreground font-medium">Entity: {log.entity}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {log.details && (
                    <p className="text-muted-foreground leading-relaxed pt-1 bg-muted/30 p-2 rounded border border-border/40 font-mono text-[11px]">
                      {log.details}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-primary" />
                      Actor: <strong className="text-foreground">{log.user?.name || log.user?.email || "System"}</strong> ({log.user?.userRole || "SYSTEM"})
                    </span>
                    <span>Log ID: {log.id.slice(0, 10)}...</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground text-xs">
              No audit logs recorded for this lead yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
