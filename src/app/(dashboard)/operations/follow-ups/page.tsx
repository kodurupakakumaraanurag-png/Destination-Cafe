import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { FollowUpsView } from "@/components/operations/followups-view";
import { getFollowUps } from "@/lib/actions/followup-actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Follow-ups Schedule | Destination Cafe CRM",
  description: "Scheduled client outreach, today's follow-ups, upcoming tasks, and overdue items.",
};

export default async function FollowUpsPage() {
  let data: Awaited<ReturnType<typeof getFollowUps>> = {
    today: [],
    upcoming: [],
    overdue: [],
    leadsWithNextAction: [],
  };

  try {
    data = await getFollowUps();
  } catch (error: unknown) {
    console.error("Error loading follow-ups schedule:", error);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Follow-ups Schedule &amp; Client Outreach"
        description="Categorized view of today's client outreach, upcoming follow-up deadlines, and overdue task action items."
        badge={<Badge variant="outline">Client Outreach</Badge>}
      />

      <FollowUpsView
        today={data.today}
        upcoming={data.upcoming}
        overdue={data.overdue}
        leadsWithNextAction={data.leadsWithNextAction}
      />
    </PageContainer>
  );
}
