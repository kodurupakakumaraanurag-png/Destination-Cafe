import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { AuditLogsView } from "@/components/admin/audit-logs-view";
import { getAuditLogs } from "@/lib/actions/audit-log-actions";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Audit Logs & Security Trail | Destination Cafe CRM",
  description: "Security events, system actions, data updates, and authentication audit logs.",
};

export default async function AuditLogsPage() {
  let data: Awaited<ReturnType<typeof getAuditLogs>> = {
    totalCount: 0,
    page: 1,
    pageSize: 30,
    totalPages: 0,
    logs: [],
    distinctActions: [],
    distinctEntities: [],
  };

  let users: Array<{ id: string; name: string | null; email: string }> = [];

  try {
    data = await getAuditLogs();
    users = await prisma.user.findMany({
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    });
  } catch (error: unknown) {
    console.error("Error loading audit logs:", error);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Security &amp; Operations Audit Trail"
        description="Chronological log of platform events, user activity, data updates, CSV ingestion, and security actions."
        badge={<Badge variant="outline">Security Audit Log</Badge>}
      />

      <AuditLogsView
        initialLogs={data.logs}
        totalCount={data.totalCount}
        distinctActions={data.distinctActions}
        distinctEntities={data.distinctEntities}
        users={users}
      />
    </PageContainer>
  );
}
