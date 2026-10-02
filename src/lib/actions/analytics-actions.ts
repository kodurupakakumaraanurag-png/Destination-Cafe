"use server";

import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/server-auth";
import { auditSystemDataQuality, MinimalLead } from "@/lib/data-quality";

export async function getAnalyticsOverviewData() {
  await requirePermission("VIEW_ANALYTICS");

  // 1. Total Leads & Leads by Status (Pipeline Distribution)
  const leadsByStatus = await prisma.lead.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  const totalLeads = await prisma.lead.count({ where: { archivedAt: null } });

  // 2. Leads by Priority
  const leadsByPriority = await prisma.lead.groupBy({
    by: ["priority"],
    _count: { id: true },
  });

  // 3. Leads by Source
  const leadsBySource = await prisma.lead.groupBy({
    by: ["source"],
    _count: { id: true },
  });

  // 4. Lead Score Average
  const leadScoreAgg = await prisma.lead.aggregate({
    where: { archivedAt: null },
    _avg: { calculatedLeadScore: true, recordedLeadScore: true },
  });

  // 5. Activities Count by Type
  const activitiesByType = await prisma.activity.groupBy({
    by: ["type"],
    _count: { id: true },
  });

  // 6. Tasks Summary
  const totalTasks = await prisma.task.count();
  const completedTasks = await prisma.task.count({ where: { status: "COMPLETED" } });
  const pendingTasks = await prisma.task.count({ where: { status: "PENDING" } });

  // 7. Opportunities Summary
  const totalOpportunities = await prisma.opportunity.count();
  const wonOpportunities = await prisma.opportunity.count({ where: { stage: "WON" } });
  const oppValueAgg = await prisma.opportunity.aggregate({
    _sum: { value: true },
  });

  // 8. Monthly Lead Acquisition Trend (Group by Month)
  const rawLeadsForTrend = await prisma.lead.findMany({
    where: { archivedAt: null },
    select: { createdAt: true, dateAdded: true },
    orderBy: { createdAt: "asc" },
  });

  const monthlyMap: Record<string, number> = {};
  for (const l of rawLeadsForTrend) {
    const d = l.dateAdded || l.createdAt;
    const monthKey = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + 1;
  }

  const monthlyTrend = Object.entries(monthlyMap).map(([month, count]) => ({
    month,
    leads: count,
  }));

  // 9. Data Quality Audit Engine Metrics
  const rawLeadsForDQ = await prisma.lead.findMany({
    where: { archivedAt: null },
  });
  const dqAudit = auditSystemDataQuality(rawLeadsForDQ as unknown as MinimalLead[]);

  // 10. Conversion Rate Calculation
  const qualifiedOrWonCount = await prisma.lead.count({
    where: {
      archivedAt: null,
      status: { in: ["QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "CONVERTED"] },
    },
  });
  const conversionRate = totalLeads > 0 ? Math.round((qualifiedOrWonCount / totalLeads) * 100) : 0;

  return {
    totalLeads,
    averageLeadScore: Math.round(leadScoreAgg._avg.calculatedLeadScore || 0),
    averageRecordedScore: Math.round(leadScoreAgg._avg.recordedLeadScore || 0),
    conversionRate,
    pipelineDistribution: leadsByStatus.map((item) => ({
      stage: item.status,
      count: item._count.id,
    })),
    priorityDistribution: leadsByPriority.map((item) => ({
      priority: item.priority,
      count: item._count.id,
    })),
    sourceDistribution: leadsBySource.map((item) => ({
      source: item.source || "Direct / Unspecified",
      count: item._count.id,
    })),
    activitiesByType: activitiesByType.map((item) => ({
      type: item.type,
      count: item._count.id,
    })),
    taskMetrics: {
      total: totalTasks,
      completed: completedTasks,
      pending: pendingTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    },
    opportunityMetrics: {
      total: totalOpportunities,
      won: wonOpportunities,
      totalValue: oppValueAgg._sum.value || 0,
    },
    monthlyTrend,
    dataQuality: {
      overallScore: dqAudit.averageQualityScore,
      completenessPercent: dqAudit.averageCompleteness,
      discrepancyCount: dqAudit.scoreDiscrepancyCount,
      duplicateCount: dqAudit.duplicateEmailCount + dqAudit.duplicateCompanyCount,
      issuesCount: dqAudit.totalErrors + dqAudit.totalWarnings,
    },
  };
}
