import prisma from "@/lib/prisma";
import { Priority, LeadStatus, TaskStatus, OpportunityStage, ActivityType } from "@prisma/client";

export interface DashboardMetrics {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  openOpportunities: number;
  wonOpportunities: number;
  followUpsDue: number;
  overdueTasks: number;
  avgLeadScore: number;
}

export interface PipelineStageItem {
  stage: string;
  count: number;
  color: string;
}

export interface SourceDistributionItem {
  source: string;
  count: number;
}

export interface ScoreDistributionItem {
  range: string;
  count: number;
}

export interface PriorityDistributionItem {
  priority: string;
  count: number;
  color: string;
}

export interface DataQualitySummary {
  missingContactPersonCount: number;
  missingWebsiteCount: number;
  scoreDiscrepancyCount: number;
  unassignedLeadCount: number;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string | null;
  type: ActivityType;
  createdAt: Date;
  userEmail: string | null;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  status: TaskStatus;
  dueDate: Date | null;
  isOverdue: boolean;
  assignedUserEmail: string | null;
  companyName: string | null;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  pipelineData: PipelineStageItem[];
  sourceData: SourceDistributionItem[];
  scoreData: ScoreDistributionItem[];
  priorityData: PriorityDistributionItem[];
  dataQuality: DataQualitySummary;
  recentActivities: ActivityItem[];
  upcomingTasks: TaskItem[];
  isOfflineFallback?: boolean;
  error?: string | null;
}

// Fallback dataset respecting exact Destination Cafe dossier discrepancy (recorded 18, calculated 0)
const FALLBACK_DASHBOARD_DATA: DashboardData = {
  metrics: {
    totalLeads: 5,
    newLeads: 1,
    qualifiedLeads: 1,
    openOpportunities: 2,
    wonOpportunities: 1,
    followUpsDue: 2,
    overdueTasks: 1,
    avgLeadScore: 17.8,
  },
  pipelineData: [
    { stage: "New", count: 1, color: "#3b82f6" },
    { stage: "Contacted", count: 1, color: "#8b5cf6" },
    { stage: "In Progress", count: 1, color: "#f59e0b" },
    { stage: "Qualified", count: 1, color: "#10b981" },
    { stage: "Converted", count: 1, color: "#059669" },
  ],
  sourceData: [
    { source: "Google Sheet Import", count: 1 },
    { source: "Website Lead", count: 1 },
    { source: "LinkedIn Outreach", count: 1 },
    { source: "Partner Referral", count: 1 },
    { source: "Direct Inbound", count: 1 },
  ],
  scoreData: [
    { range: "0 - 5", count: 1 }, // Includes Destination Cafe (calculated: 0, recorded: 18)
    { range: "6 - 12", count: 0 },
    { range: "13 - 18", count: 1 },
    { range: "19 - 25", count: 2 },
    { range: "26+", count: 1 },
  ],
  priorityData: [
    { priority: "Low", count: 0, color: "#64748b" },
    { priority: "Medium", count: 2, color: "#3b82f6" },
    { priority: "High", count: 2, color: "#f59e0b" },
    { priority: "Urgent", count: 1, color: "#ef4444" },
  ],
  dataQuality: {
    missingContactPersonCount: 1, // Destination Cafe
    missingWebsiteCount: 1, // Destination Cafe
    scoreDiscrepancyCount: 1, // Destination Cafe (recorded 18, calculated 0)
    unassignedLeadCount: 1,
  },
  recentActivities: [
    {
      id: "act-1",
      title: "Initial Record Seeded",
      description: "Destination Cafe intake record seeded with recordedLeadScore 18 and calculated score 0.",
      type: ActivityType.SYSTEM_EVENT,
      createdAt: new Date("2026-09-21"),
      userEmail: "admin@destinationcafe.com",
    },
    {
      id: "act-2",
      title: "Outreach Call with Rajesh Kumar",
      description: "Discussed technical requirements for Apex Tech Solutions.",
      type: ActivityType.CALL,
      createdAt: new Date(),
      userEmail: "sales@destinationcafe.com",
    },
  ],
  upcomingTasks: [
    {
      id: "tsk-1",
      title: "Prepare CRM Proposal for Destination Cafe",
      description: "Draft enterprise web solution proposal and outline custom lead management module.",
      priority: Priority.HIGH,
      status: TaskStatus.PENDING,
      dueDate: new Date(Date.now() + 86400000 * 2),
      isOverdue: false,
      assignedUserEmail: "sales@destinationcafe.com",
      companyName: "Destination Cafe",
    },
    {
      id: "tsk-2",
      title: "Follow up on contract details with [DEMO] Metro Logistics",
      description: "Review legal clauses and pricing breakdown.",
      priority: Priority.URGENT,
      status: TaskStatus.PENDING,
      dueDate: new Date(Date.now() - 86400000 * 1),
      isOverdue: true,
      assignedUserEmail: "sales@destinationcafe.com",
      companyName: "[DEMO] Metro Logistics",
    },
  ],
  isOfflineFallback: true,
};

export async function fetchDashboardData(): Promise<DashboardData> {
  try {
    const now = new Date();

    // Perform database queries
    const leads = await prisma.lead.findMany({
      include: {
        assignedUser: true,
        opportunities: true,
        tasks: true,
        activities: true,
      },
    });

    const tasks = await prisma.task.findMany({
      include: {
        assignedUser: true,
        lead: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const opportunities = await prisma.opportunity.findMany({});
    const activities = await prisma.activity.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Compute Metrics
    const totalLeads = leads.length;
    const newLeads = leads.filter((l) => l.status === LeadStatus.NEW).length;
    const qualifiedLeads = leads.filter((l) => l.status === LeadStatus.QUALIFIED).length;
    const openOpportunities = opportunities.filter(
      (o) => o.stage !== OpportunityStage.CLOSED_WON && o.stage !== OpportunityStage.CLOSED_LOST
    ).length;
    const wonOpportunities = opportunities.filter((o) => o.stage === OpportunityStage.CLOSED_WON).length;

    const followUpsDue = tasks.filter((t) => t.status === TaskStatus.PENDING).length;
    const overdueTasks = tasks.filter(
      (t) => t.status === TaskStatus.PENDING && t.dueDate && new Date(t.dueDate) < now
    ).length;

    // Calculate Average Lead Score
    const totalScoreSum = leads.reduce((acc, l) => acc + (l.recordedLeadScore ?? l.calculatedLeadScore ?? 0), 0);
    const avgLeadScore = totalLeads > 0 ? Number((totalScoreSum / totalLeads).toFixed(1)) : 0;

    // Pipeline Stage Distribution
    const pipelineCounts: Record<string, number> = {
      New: 0,
      Contacted: 0,
      "In Progress": 0,
      Qualified: 0,
      Converted: 0,
      Unqualified: 0,
      Archived: 0,
    };
    leads.forEach((l) => {
      if (l.status === LeadStatus.NEW) pipelineCounts["New"]++;
      else if (l.status === LeadStatus.CONTACTED) pipelineCounts["Contacted"]++;
      else if (l.status === LeadStatus.IN_PROGRESS) pipelineCounts["In Progress"]++;
      else if (l.status === LeadStatus.QUALIFIED) pipelineCounts["Qualified"]++;
      else if (l.status === LeadStatus.CONVERTED) pipelineCounts["Converted"]++;
      else if (l.status === LeadStatus.UNQUALIFIED) pipelineCounts["Unqualified"]++;
      else if (l.status === LeadStatus.ARCHIVED) pipelineCounts["Archived"]++;
    });

    const pipelineData: PipelineStageItem[] = [
      { stage: "New", count: pipelineCounts["New"], color: "#3b82f6" },
      { stage: "Contacted", count: pipelineCounts["Contacted"], color: "#8b5cf6" },
      { stage: "In Progress", count: pipelineCounts["In Progress"], color: "#f59e0b" },
      { stage: "Qualified", count: pipelineCounts["Qualified"], color: "#10b981" },
      { stage: "Converted", count: pipelineCounts["Converted"], color: "#059669" },
      { stage: "Unqualified", count: pipelineCounts["Unqualified"], color: "#64748b" },
      { stage: "Archived", count: pipelineCounts["Archived"], color: "#475569" },
    ];

    // Source Distribution
    const sourceMap: Record<string, number> = {};
    leads.forEach((l) => {
      const src = l.source || "Unknown";
      sourceMap[src] = (sourceMap[src] || 0) + 1;
    });

    const sourceData: SourceDistributionItem[] = Object.entries(sourceMap).map(([source, count]) => ({
      source,
      count,
    }));

    // Score Distribution (0-5, 6-12, 13-18, 19-25, 26+)
    const scoreBrackets = {
      "0 - 5": 0,
      "6 - 12": 0,
      "13 - 18": 0,
      "19 - 25": 0,
      "26+": 0,
    };
    leads.forEach((l) => {
      const s = l.calculatedLeadScore ?? 0;
      if (s <= 5) scoreBrackets["0 - 5"]++;
      else if (s <= 12) scoreBrackets["6 - 12"]++;
      else if (s <= 18) scoreBrackets["13 - 18"]++;
      else if (s <= 25) scoreBrackets["19 - 25"]++;
      else scoreBrackets["26+"]++;
    });

    const scoreData: ScoreDistributionItem[] = Object.entries(scoreBrackets).map(([range, count]) => ({
      range,
      count,
    }));

    // Priority Distribution
    const priorityCounts: Record<string, number> = { Low: 0, Medium: 0, High: 0, Urgent: 0 };
    leads.forEach((l) => {
      if (l.priority === Priority.LOW) priorityCounts["Low"]++;
      else if (l.priority === Priority.MEDIUM) priorityCounts["Medium"]++;
      else if (l.priority === Priority.HIGH) priorityCounts["High"]++;
      else if (l.priority === Priority.URGENT) priorityCounts["Urgent"]++;
    });

    const priorityData: PriorityDistributionItem[] = [
      { priority: "Low", count: priorityCounts["Low"], color: "#64748b" },
      { priority: "Medium", count: priorityCounts["Medium"], color: "#3b82f6" },
      { priority: "High", count: priorityCounts["High"], color: "#f59e0b" },
      { priority: "Urgent", count: priorityCounts["Urgent"], color: "#ef4444" },
    ];

    // Data Quality Metrics
    const missingContactPersonCount = leads.filter((l) => !l.contactPerson).length;
    const missingWebsiteCount = leads.filter(
      (l) => !l.website || l.website.includes("No verified")
    ).length;
    const scoreDiscrepancyCount = leads.filter(
      (l) => l.recordedLeadScore !== null && l.calculatedLeadScore !== null && l.recordedLeadScore !== l.calculatedLeadScore
    ).length;
    const unassignedLeadCount = leads.filter((l) => !l.assignedUserId).length;

    const formattedActivities: ActivityItem[] = activities.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      type: a.type,
      createdAt: a.createdAt,
      userEmail: a.user?.email || null,
    }));

    const formattedTasks: TaskItem[] = tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      priority: t.priority,
      status: t.status,
      dueDate: t.dueDate,
      isOverdue: Boolean(t.dueDate && new Date(t.dueDate) < now && t.status === TaskStatus.PENDING),
      assignedUserEmail: t.assignedUser?.email || null,
      companyName: t.lead?.company || null,
    }));

    return {
      metrics: {
        totalLeads,
        newLeads,
        qualifiedLeads,
        openOpportunities,
        wonOpportunities,
        followUpsDue,
        overdueTasks,
        avgLeadScore,
      },
      pipelineData,
      sourceData,
      scoreData,
      priorityData,
      dataQuality: {
        missingContactPersonCount,
        missingWebsiteCount,
        scoreDiscrepancyCount,
        unassignedLeadCount,
      },
      recentActivities: formattedActivities,
      upcomingTasks: formattedTasks,
      isOfflineFallback: false,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn("Database query error, returning fallback dataset:", errorMsg);
    return FALLBACK_DASHBOARD_DATA;
  }
}
