import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { ActivitiesView } from "@/components/activities/activities-view";
import { getActivities } from "@/lib/actions/activity-actions";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Activity Log & Timeline | Destination Cafe CRM",
  description: "Global CRM activity log, calls, meetings, emails, and interaction timeline.",
};

export default async function ActivitiesPage() {
  let activities: Awaited<ReturnType<typeof getActivities>> = [];
  let leads: Array<{ id: string; company: string }> = [];

  try {
    activities = await getActivities();
    leads = await prisma.lead.findMany({
      where: { archivedAt: null },
      select: { id: true, company: true },
      orderBy: { company: "asc" },
    });
  } catch (error: unknown) {
    console.error("Error loading activities stream:", error);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Activity Log &amp; Timeline"
        description="Audit interaction history including phone calls, client meetings, emails, and notes."
        badge={<Badge variant="outline">Activity Audit Stream</Badge>}
      />

      <ActivitiesView initialActivities={activities} leads={leads} />
    </PageContainer>
  );
}
