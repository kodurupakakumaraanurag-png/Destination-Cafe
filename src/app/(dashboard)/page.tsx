import { Suspense } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchDashboardData } from "@/lib/data/dashboard-data";
import { PipelineChart } from "@/components/dashboard/pipeline-chart";
import { SourceChart } from "@/components/dashboard/source-chart";
import { ScoreChart } from "@/components/dashboard/score-chart";
import { PriorityChart } from "@/components/dashboard/priority-chart";
import { DataQualityCard } from "@/components/dashboard/data-quality-card";
import { RecentActivityList } from "@/components/dashboard/recent-activity-list";
import { UpcomingTasksList } from "@/components/dashboard/upcoming-tasks-list";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import {
  Users,
  UserCheck,
  TrendingUp,
  Award,
  Clock,
  AlertCircle,
  Star,
  CheckCircle2,
  Database,
  ArrowUpRight,
} from "lucide-react";

async function DashboardContent() {
  const data = await fetchDashboardData();
  const { metrics, pipelineData, sourceData, scoreData, priorityData, dataQuality, recentActivities, upcomingTasks, isOfflineFallback } = data;

  return (
    <div className="space-y-6">
      {/* Offline Fallback Banner */}
      {isOfflineFallback && (
        <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              <strong>Local Database Mode:</strong> Displaying database intake state (including Destination Cafe recorded 18 vs calculated 0 score discrepancy).
            </span>
          </div>
          <Badge variant="outline" className="text-[10px] shrink-0 border-amber-500/30">
            Prisma Live Query Ready
          </Badge>
        </div>
      )}

      {/* 8 Required KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Leads */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between text-xs font-medium">
              <span>Total Leads</span>
              <Users className="w-4 h-4 text-primary" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-foreground">{metrics.totalLeads}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-[11px] text-muted-foreground flex items-center gap-1">
            <span className="text-emerald-600 font-semibold flex items-center">
              Active <ArrowUpRight className="w-3 h-3" />
            </span>
            <span>Intake dossier records</span>
          </CardContent>
        </Card>

        {/* 2. New Leads */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between text-xs font-medium">
              <span>New Leads</span>
              <UserCheck className="w-4 h-4 text-blue-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-foreground">{metrics.newLeads}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-[11px] text-muted-foreground">
            Awaiting initial qualification
          </CardContent>
        </Card>

        {/* 3. Qualified Leads */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between text-xs font-medium">
              <span>Qualified Leads</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-foreground">{metrics.qualifiedLeads}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-[11px] text-muted-foreground">
            Technical &amp; budget verified
          </CardContent>
        </Card>

        {/* 4. Open Opportunities */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between text-xs font-medium">
              <span>Open Opportunities</span>
              <TrendingUp className="w-4 h-4 text-amber-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-foreground">{metrics.openOpportunities}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-[11px] text-muted-foreground">
            Active pipeline negotiations
          </CardContent>
        </Card>

        {/* 5. Won Opportunities */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between text-xs font-medium">
              <span>Won Opportunities</span>
              <Award className="w-4 h-4 text-purple-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-foreground">{metrics.wonOpportunities}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-[11px] text-muted-foreground">
            Converted enterprise deals
          </CardContent>
        </Card>

        {/* 6. Follow-ups Due */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between text-xs font-medium">
              <span>Follow-ups Due</span>
              <Clock className="w-4 h-4 text-indigo-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-foreground">{metrics.followUpsDue}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-[11px] text-muted-foreground">
            Scheduled client outreach
          </CardContent>
        </Card>

        {/* 7. Overdue Tasks */}
        <Card className={metrics.overdueTasks > 0 ? "border-red-500/30 bg-red-500/5" : ""}>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between text-xs font-medium">
              <span>Overdue Tasks</span>
              <AlertCircle className="w-4 h-4 text-red-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-foreground">{metrics.overdueTasks}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-[11px] text-muted-foreground">
            Action items past due date
          </CardContent>
        </Card>

        {/* 8. Average Lead Score */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between text-xs font-medium">
              <span>Average Lead Score</span>
              <Star className="w-4 h-4 text-amber-400" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-foreground">{metrics.avgLeadScore}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-[11px] text-muted-foreground">
            Out of max 30 points
          </CardContent>
        </Card>
      </div>

      {/* 7 Core Dashboard Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Lead Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold">1. Lead Pipeline Stage Breakdown</CardTitle>
            <CardDescription className="text-xs">Count of leads across pipeline progression stages.</CardDescription>
          </CardHeader>
          <CardContent>
            <PipelineChart data={pipelineData} />
          </CardContent>
        </Card>

        {/* Section 2: Lead Source Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold">2. Lead Source Distribution</CardTitle>
            <CardDescription className="text-xs">Inbound channel channels and import origins.</CardDescription>
          </CardHeader>
          <CardContent>
            <SourceChart data={sourceData} />
          </CardContent>
        </Card>

        {/* Section 3: Lead Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold">3. Lead Score Distribution</CardTitle>
            <CardDescription className="text-xs">Distribution of lead score brackets across intake database.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScoreChart data={scoreData} />
          </CardContent>
        </Card>

        {/* Section 4: Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold">4. Priority Distribution</CardTitle>
            <CardDescription className="text-xs">Breakdown by priority level (Low, Medium, High, Urgent).</CardDescription>
          </CardHeader>
          <CardContent>
            <PriorityChart data={priorityData} />
          </CardContent>
        </Card>
      </div>

      {/* Section 5: Data Quality Summary */}
      <DataQualityCard data={dataQuality} />

      {/* Sections 6 & 7: Recent Activity and Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 6: Recent Activity */}
        <RecentActivityList activities={recentActivities} />

        {/* Section 7: Upcoming Tasks */}
        <UpcomingTasksList tasks={upcomingTasks} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Enterprise CRM Dashboard"
        description="Executive metrics, lead scoring distributions, pipeline status, and intake data quality audit."
        badge={<Badge variant="success">Phase 05 — Live CRM Dashboard</Badge>}
      />

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </PageContainer>
  );
}
