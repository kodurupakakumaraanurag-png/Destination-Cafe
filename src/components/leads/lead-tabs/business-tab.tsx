"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Briefcase, AlertCircle, FileText, Target, ArrowRight } from "lucide-react";
import { LeadDetailRecord } from "@/types/lead-detail";

interface BusinessTabProps {
  lead: LeadDetailRecord;
}

export function BusinessTab({ lead }: BusinessTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Business Understanding */}
        <Card>
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" />
              Business Understanding
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 text-xs">
            <p className="text-muted-foreground leading-relaxed bg-muted/30 p-3.5 rounded-md border border-border/40 whitespace-pre-wrap">
              {lead.businessUnderstanding || "No detailed business understanding provided."}
            </p>
          </CardContent>
        </Card>

        {/* Possible Problem */}
        <Card>
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Possible Problem / Pain Point
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 text-xs">
            <p className="text-muted-foreground leading-relaxed bg-muted/30 p-3.5 rounded-md border border-border/40 whitespace-pre-wrap">
              {lead.possibleProblem || "No specific pain point or problem recorded."}
            </p>
          </CardContent>
        </Card>

        {/* Requirement */}
        <Card>
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-500" />
              Client Requirement
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 text-xs">
            <p className="text-muted-foreground leading-relaxed bg-muted/30 p-3.5 rounded-md border border-border/40 whitespace-pre-wrap">
              {lead.requirement || "No detailed requirement specified."}
            </p>
          </CardContent>
        </Card>

        {/* Opportunity */}
        <Card>
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-500" />
              Strategic Opportunity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 text-xs">
            <p className="text-muted-foreground leading-relaxed bg-muted/30 p-3.5 rounded-md border border-border/40 whitespace-pre-wrap">
              {lead.opportunity || "No strategic opportunity potential documented."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Next Action & Execution Details */}
      <Card>
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-primary" />
            Next Recommended Action
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 text-xs">
          <div className="p-3.5 bg-primary/5 border border-primary/20 rounded-md">
            <p className="font-semibold text-foreground text-sm">{lead.nextAction || "No next action defined."}</p>
            <div className="mt-2 text-muted-foreground text-[11px]">
              Lead Source: <strong>{lead.source || "Unknown"}</strong> | Preferred Channel: <strong>{lead.contactMethod || "Unspecified"}</strong>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
