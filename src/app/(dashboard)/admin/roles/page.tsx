import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";
import { requirePermission } from "@/lib/server-auth";

export default async function RolesPage() {
  await requirePermission("MANAGE_USERS");

  return (
    <PageContainer>
      <PageHeader
        title="Roles & Permissions Matrix"
        description="Configure access control permissions across ADMIN, MANAGER, SALES, ANALYST, and VIEWER roles."
        badge={<Badge variant="outline">Placeholder Route</Badge>}
      />
      <EmptyState
        icon={<ShieldCheck className="w-8 h-8 text-primary" />}
        title="Roles & Permissions Placeholder"
        description="RBAC matrix management will be implemented in subsequent phases."
      />
    </PageContainer>
  );
}
