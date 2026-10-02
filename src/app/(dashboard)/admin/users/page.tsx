import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { UserCheck } from "lucide-react";
import { requirePermission } from "@/lib/server-auth";

export default async function AdminUsersPage() {
  await requirePermission("MANAGE_USERS");

  return (
    <PageContainer>
      <PageHeader
        title="User Administration"
        description="Manage user accounts, roles, and status."
        badge={<Badge variant="outline">Placeholder Route</Badge>}
      />
      <EmptyState
        icon={<UserCheck className="w-8 h-8 text-primary" />}
        title="User Administration Placeholder"
        description="User management administration will be implemented in subsequent phases."
      />
    </PageContainer>
  );
}
