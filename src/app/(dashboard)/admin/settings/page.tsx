import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Settings } from "lucide-react";
import { requireAuth } from "@/lib/server-auth";

export default async function SettingsPage() {
  await requireAuth();

  return (
    <PageContainer>
      <PageHeader
        title="System & Account Settings"
        description="Configure CRM environment settings, notifications, and preferences."
        badge={<Badge variant="outline">Placeholder Route</Badge>}
      />
      <EmptyState
        icon={<Settings className="w-8 h-8 text-primary" />}
        title="Settings Module Placeholder"
        description="System configuration settings will be implemented in subsequent phases."
      />
    </PageContainer>
  );
}
