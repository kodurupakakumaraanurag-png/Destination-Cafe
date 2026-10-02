"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Award, CheckCircle2, Sliders, Edit3 } from "lucide-react";
import { LeadDetailRecord } from "@/types/lead-detail";

interface ScoringTabProps {
  lead: LeadDetailRecord;
  onOpenScoreModal: () => void;
}

export function ScoringTab({ lead, onOpenScoreModal }: ScoringTabProps) {
  const calculatedScore = lead.calculatedLeadScore ?? 0;
  const recordedScore = lead.recordedLeadScore;
  const hasDiscrepancy = recordedScore !== null && recordedScore !== undefined && recordedScore !== calculatedScore;
  const discrepancyDiff = recordedScore !== null && recordedScore !== undefined ? Math.abs(recordedScore - calculatedScore) : 0;

  const isDestinationCafe = lead.company === "Destination Cafe";

  const scoringDimensions = [
    {
      name: "Digital Presence",
      score: lead.digitalPresenceScore ?? 0,
      description: "Website quality, digital footprint, search visibility, and active social profiles.",
    },
    {
      name: "Hiring Activity",
      score: lead.hiringActivityScore ?? 0,
      description: "Recent job postings, company growth trajectory, and technical hiring headcount.",
    },
    {
      name: "Tech Stack Fit",
      score: lead.techStackFitScore ?? 0,
      description: "Alignment with modern web solutions, API integrations, and tech stack compatibility.",
    },
    {
      name: "Funding / Revenue",
      score: lead.fundingRevenueScore ?? 0,
      description: "Financial capacity, investment stage, annual revenue estimates, and paying ability.",
    },
    {
      name: "Project Urgency",
      score: lead.projectUrgencyScore ?? 0,
      description: "Implementation timeline urgency, operational bottleneck, and decision speed.",
    },
    {
      name: "Budget Clarity",
      score: lead.budgetClarityScore ?? 0,
      description: "Budget definition, resource allocation readiness, and procurement clarity.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Score Discrepancy Banner */}
      {hasDiscrepancy ? (
        <div className="p-5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-lg space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-200 dark:border-amber-800/60 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 rounded-md">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-amber-900 dark:text-amber-100">
                  Score discrepancy detected
                </h3>
                <div className="text-xs font-semibold text-amber-800 dark:text-amber-300 mt-0.5">
                  Difference: <span className="font-extrabold text-amber-900 dark:text-amber-100">{discrepancyDiff} points</span>
                </div>
              </div>
            </div>
            <Button onClick={onOpenScoreModal} size="sm" className="bg-amber-600 hover:bg-amber-700 text-white border-none shadow-sm">
              <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Adjust Scoring
            </Button>
          </div>

          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            {isDestinationCafe ? (
              <>
                <strong>Destination Cafe Specific Analysis:</strong> In the raw CRM intake dataset, Destination Cafe was imported with an initial recorded score of <strong>18/30</strong>. However, all six individual score dimensions were recorded as zero (0, 0, 0, 0, 0, 0), resulting in a sum-calculated score of <strong>0/30</strong>. The platform tracks both values explicitly to preserve intake fidelity while highlighting analytical discrepancies.
              </>
            ) : (
              <>
                The recorded score in external intake documentation (<strong>{recordedScore}/30</strong>) does not match the computed sum of individual score ratings (<strong>{calculatedScore}/30</strong>).
              </>
            )}
          </p>
        </div>
      ) : (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-md text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                Scoring Dimensions Synchronized
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Calculated score ({calculatedScore}/30) is aligned with recorded intake metadata.
              </p>
            </div>
          </div>
          <Button onClick={onOpenScoreModal} variant="outline" size="sm" className="border-emerald-300 text-emerald-800 dark:text-emerald-200">
            Edit Scores
          </Button>
        </div>
      )}

      {/* Overview Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-5 border-l-4 border-l-primary">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Calculated Lead Score</span>
              <div className="text-3xl font-extrabold text-foreground mt-1">
                {calculatedScore} <span className="text-sm font-normal text-muted-foreground">/ 30</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Sum of 6 intake evaluation dimensions (0–5 rating each).
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg text-primary">
              <Award className="w-7 h-7" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Maximum Possible:</span>
            <span className="font-semibold text-foreground">30 Points</span>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-amber-500">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recorded Intake Score</span>
              <div className="text-3xl font-extrabold text-foreground mt-1">
                {recordedScore !== null && recordedScore !== undefined ? `${recordedScore}` : "None"}{" "}
                <span className="text-sm font-normal text-muted-foreground">/ 30</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Raw score imported from external CRM intake dossier.
              </p>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400">
              <Sliders className="w-7 h-7" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Status:</span>
            <span className={`font-semibold ${hasDiscrepancy ? "text-amber-600" : "text-emerald-600"}`}>
              {hasDiscrepancy ? `Discrepancy (${discrepancyDiff} pts)` : "Verified Match"}
            </span>
          </div>
        </Card>
      </div>

      {/* 6 Dimensional Breakdown Cards */}
      <Card>
        <CardHeader className="border-b border-border pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Sliders className="w-4 h-4 text-primary" />
            Six-Dimensional Scoring Breakdown
          </CardTitle>
          <Button onClick={onOpenScoreModal} size="sm" variant="outline" className="h-8 text-xs">
            <Edit3 className="w-3.5 h-3.5 mr-1" /> Update Dimensions
          </Button>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scoringDimensions.map((dim) => {
              const percentage = (dim.score / 5) * 100;
              return (
                <div key={dim.name} className="p-4 rounded-lg border border-border bg-card space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-xs text-foreground">{dim.name}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                      {dim.score} / 5
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">{dim.description}</p>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-full transition-all duration-300 ${
                        dim.score >= 4
                          ? "bg-emerald-500"
                          : dim.score >= 2
                          ? "bg-primary"
                          : dim.score > 0
                          ? "bg-amber-500"
                          : "bg-muted-foreground/30"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
