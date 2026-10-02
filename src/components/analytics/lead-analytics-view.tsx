"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  BarChart3,
  PieChart as PieIcon,
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

interface LeadAnalyticsViewProps {
  data: {
    totalLeads: number;
    averageLeadScore: number;
    averageRecordedScore: number;
    conversionRate: number;
    pipelineDistribution: Array<{ stage: string; count: number }>;
    priorityDistribution: Array<{ priority: string; count: number }>;
    sourceDistribution: Array<{ source: string; count: number }>;
    monthlyTrend: Array<{ month: string; leads: number }>;
    dataQuality: {
      completenessPercent: number;
      discrepancyCount: number;
    };
  };
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#ef4444"];

export function LeadAnalyticsView({ data }: LeadAnalyticsViewProps) {
  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-primary">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Leads Analyzed</div>
          <div className="text-2xl font-extrabold text-foreground mt-1">{data.totalLeads}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Active Database Dossiers</div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Calculated Score Avg</div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {data.averageLeadScore} <span className="text-xs font-normal text-muted-foreground">/ 30</span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Sum of 6 Score Dimensions</div>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Recorded Score Avg</div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
            {data.averageRecordedScore} <span className="text-xs font-normal text-muted-foreground">/ 30</span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Intake Recorded Field Avg</div>
        </Card>

        <Card className="p-4 border-l-4 border-l-indigo-500">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Qualification Rate</div>
          <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
            {data.conversionRate}%
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Leads Qualified / Won</div>
        </Card>
      </div>

      {/* Grid 1: Monthly Acquisition Trend & Priority Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Monthly Lead Ingestion Acquisition Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[250px] w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="leads" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Leads" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-primary" />
              Priority Distribution Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[250px] w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={data.priorityDistribution}
                    dataKey="count"
                    nameKey="priority"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    paddingAngle={3}
                    label={({ name, value }: { name?: string; value?: number }) => `${name}: ${value}`}
                  >
                    {data.priorityDistribution.map((entry, index) => (
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
