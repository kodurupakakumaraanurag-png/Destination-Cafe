"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Award,
  PieChart as PieIcon,
  CheckCircle2,
  Activity,
  CheckSquare,
  TrendingUp,
  BarChart3,
  ShieldCheck,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface OverviewAnalyticsProps {
  data: {
    totalLeads: number;
    averageLeadScore: number;
    averageRecordedScore: number;
    conversionRate: number;
    pipelineDistribution: Array<{ stage: string; count: number }>;
    priorityDistribution: Array<{ priority: string; count: number }>;
    sourceDistribution: Array<{ source: string; count: number }>;
    activitiesByType: Array<{ type: string; count: number }>;
    taskMetrics: {
      total: number;
      completed: number;
      pending: number;
      completionRate: number;
    };
    opportunityMetrics: {
      total: number;
      won: number;
      totalValue: number;
    };
    monthlyTrend: Array<{ month: string; leads: number }>;
    dataQuality: {
      overallScore: number;
      completenessPercent: number;
      discrepancyCount: number;
      duplicateCount: number;
      issuesCount: number;
    };
  };
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#6366f1", "#14b8a6", "#ef4444"];

export function OverviewAnalyticsView({ data }: OverviewAnalyticsProps) {
  return (
    <div className="space-y-6">
      {/* Top 4 KPI Metrics Header */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-primary">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Active Leads</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-extrabold text-foreground mt-1">{data.totalLeads}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Ingested Database Dossiers</div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Avg Lead Score</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {data.averageLeadScore} <span className="text-xs font-normal text-muted-foreground">/ 30</span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Scoring Engine Average</div>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pipeline Conversion</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
            {data.conversionRate}%
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Qualified &amp; Won Rate</div>
        </Card>

        <Card className="p-4 border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Data Health Score</span>
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
            {data.dataQuality.overallScore}%
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Completeness &amp; Quality Audit</div>
        </Card>
      </div>

      {/* Grid 1: Monthly Acquisition & Pipeline Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Chart */}
        <Card>
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Monthly Lead Ingestion &amp; Growth Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {data.monthlyTrend.length === 0 ? (
              <div className="text-center py-10 text-xs text-muted-foreground">No monthly trend data recorded</div>
            ) : (
              <div className="h-[260px] w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="month" tickLine={false} stroke="#888888" fontSize={11} />
                    <YAxis tickLine={false} stroke="#888888" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--background)",
                        borderColor: "var(--border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="leads" fill="var(--color-primary, #3b82f6)" radius={[4, 4, 0, 0]} name="Leads" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pipeline Distribution Chart */}
        <Card>
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-primary" />
              CRM Pipeline Stage Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {data.pipelineDistribution.length === 0 ? (
              <div className="text-center py-10 text-xs text-muted-foreground">No pipeline stages recorded</div>
            ) : (
              <div className="h-[260px] w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={data.pipelineDistribution}
                      dataKey="count"
                      nameKey="stage"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={45}
                      paddingAngle={2}
                      label={({ name, value }: { name?: string; value?: number }) => `${name}: ${value}`}
                    >
                      {data.pipelineDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--background)",
                        borderColor: "var(--border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Grid 2: Source Distribution & Activity Stream Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Distribution */}
        <Card>
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Lead Acquisition Channels &amp; Sources
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {data.sourceDistribution.length === 0 ? (
              <div className="text-center py-10 text-xs text-muted-foreground">No acquisition sources recorded</div>
            ) : (
              <div className="space-y-3 text-xs">
                {data.sourceDistribution.map((src, i) => {
                  const pct = Math.round((src.count / data.totalLeads) * 100) || 0;
                  return (
                    <div key={src.source} className="space-y-1">
                      <div className="flex items-center justify-between font-semibold text-foreground">
                        <span>{src.source}</span>
                        <span>
                          {src.count} leads ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: COLORS[i % COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Audit Stream Breakdown */}
        <Card>
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Logged Activities by Interaction Type
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {data.activitiesByType.length === 0 ? (
              <div className="text-center py-10 text-xs text-muted-foreground">No logged activities recorded</div>
            ) : (
              <div className="h-[240px] w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.activitiesByType} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <XAxis type="number" tickLine={false} stroke="#888888" fontSize={11} />
                    <YAxis dataKey="type" type="category" tickLine={false} stroke="#888888" fontSize={11} width={90} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--background)",
                        borderColor: "var(--border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Activities" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Grid 3: Operational Tasks & Data Quality Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-primary" />
            Operational Tasks Completion Performance
          </h3>
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-3 rounded-lg bg-muted/40 border border-border">
              <span className="text-muted-foreground font-semibold block text-[10px]">TOTAL TASKS</span>
              <span className="text-lg font-extrabold text-foreground">{data.taskMetrics.total}</span>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <span className="text-emerald-700 dark:text-emerald-300 font-semibold block text-[10px]">COMPLETED</span>
              <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{data.taskMetrics.completed}</span>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <span className="text-amber-700 dark:text-amber-300 font-semibold block text-[10px]">COMPLETION RATE</span>
              <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400">{data.taskMetrics.completionRate}%</span>
            </div>
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Data Quality &amp; Discrepancy Health
            </h3>
            <Link href="/analytics/data-quality">
              <Badge variant="outline" className="text-xs hover:bg-muted cursor-pointer">
                View DQ Audit &rarr;
              </Badge>
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-3 rounded-lg bg-muted/40 border border-border">
              <span className="text-muted-foreground font-semibold block text-[10px]">COMPLETENESS</span>
              <span className="text-lg font-extrabold text-foreground">{data.dataQuality.completenessPercent}%</span>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <span className="text-amber-700 dark:text-amber-300 font-semibold block text-[10px]">SCORE DISCREPANCIES</span>
              <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400">{data.dataQuality.discrepancyCount}</span>
            </div>
            <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
              <span className="text-indigo-700 dark:text-indigo-300 font-semibold block text-[10px]">DUPLICATE FLAGS</span>
              <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">{data.dataQuality.duplicateCount}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
