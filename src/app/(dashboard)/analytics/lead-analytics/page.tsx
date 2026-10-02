import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { LeadAnalyticsView } from "@/components/analytics/lead-analytics-view";
import { getAnalyticsOverviewData } from "@/lib/actions/analytics-actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Lead Analytics & Score Distribution | Destination Cafe CRM",
  description: "Conversion funnels, lead scoring breakdown, and domain statistics.",
};

export default async function LeadAnalyticsPage() {
  let data: Awaited<ReturnType<typeof getAnalyticsOverviewData>> = {
    totalLeads: 0,
    averageLeadScore: 0,
    averageRecordedScore: 0,
    conversionRate: 0,
    pipelineDistribution: [],
    priorityDistribution: [],
    sourceDistribution: [],
    activitiesByType: [],
    taskMetrics: { total: 0, completed: 0, pending: 0, completionRate: 0 },
    opportunityMetrics: { total: 0, won: 0, totalValue: 0 },
    monthlyTrend: [],
    dataQuality: { overallScore: 0, completenessPercent: 0, discrepancyCount: 0, duplicateCount: 0, issuesCount: 0 },
  };

  try {
    data = await getAnalyticsOverviewData();
  } catch (error: unknown) {
    console.error("Error loading lead analytics:", error);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Lead Analytics &amp; Score Distribution"
        description="Detailed lead scoring engine breakdown, monthly acquisition trends, priority distributions, and qualification funnels."
        badge={<Badge variant="outline">Lead Score Analytics</Badge>}
      />

      <LeadAnalyticsView data={data} />
    </PageContainer>
  );
}
