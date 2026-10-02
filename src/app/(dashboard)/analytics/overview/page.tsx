import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { OverviewAnalyticsView } from "@/components/analytics/overview-analytics-view";
import { getAnalyticsOverviewData } from "@/lib/actions/analytics-actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Analytics Overview | Destination Cafe CRM",
  description: "Executive summary metrics, monthly trends, pipeline distributions, and acquisition channels.",
};

export default async function AnalyticsOverviewPage() {
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
    console.error("Error loading analytics overview:", error);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Executive Analytics Overview"
        description="Real database metrics, pipeline stage distribution, acquisition channels, and operational indicators."
        badge={<Badge variant="success">Real DB Ingestion</Badge>}
      />

      <OverviewAnalyticsView data={data} />
    </PageContainer>
  );
}
