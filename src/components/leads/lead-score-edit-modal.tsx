"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { updateLeadScoring } from "@/lib/actions/lead-actions";
import { Award, AlertTriangle, CheckCircle2 } from "lucide-react";

interface LeadScoreEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  initialScores: {
    digitalPresenceScore: number;
    hiringActivityScore: number;
    techStackFitScore: number;
    fundingRevenueScore: number;
    projectUrgencyScore: number;
    budgetClarityScore: number;
    recordedLeadScore?: number | null;
  };
  companyName: string;
}

export function LeadScoreEditModal({
  isOpen,
  onClose,
  leadId,
  initialScores,
  companyName,
}: LeadScoreEditModalProps) {
  const [digitalPresenceScore, setDigitalPresenceScore] = React.useState(initialScores.digitalPresenceScore || 0);
  const [hiringActivityScore, setHiringActivityScore] = React.useState(initialScores.hiringActivityScore || 0);
  const [techStackFitScore, setTechStackFitScore] = React.useState(initialScores.techStackFitScore || 0);
  const [fundingRevenueScore, setFundingRevenueScore] = React.useState(initialScores.fundingRevenueScore || 0);
  const [projectUrgencyScore, setProjectUrgencyScore] = React.useState(initialScores.projectUrgencyScore || 0);
  const [budgetClarityScore, setBudgetClarityScore] = React.useState(initialScores.budgetClarityScore || 0);
  const [recordedLeadScore, setRecordedLeadScore] = React.useState<number | "">(
    initialScores.recordedLeadScore !== null && initialScores.recordedLeadScore !== undefined
      ? initialScores.recordedLeadScore
      : ""
  );

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { addToast } = useToast();

  const calculatedScore =
    Number(digitalPresenceScore || 0) +
    Number(hiringActivityScore || 0) +
    Number(techStackFitScore || 0) +
    Number(fundingRevenueScore || 0) +
    Number(projectUrgencyScore || 0) +
    Number(budgetClarityScore || 0);

  const numRecordedScore = recordedLeadScore === "" ? null : Number(recordedLeadScore);
  const hasDiscrepancy = numRecordedScore !== null && numRecordedScore !== calculatedScore;
  const discrepancyDiff = numRecordedScore !== null ? Math.abs(numRecordedScore - calculatedScore) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await updateLeadScoring(leadId, {
        digitalPresenceScore: Number(digitalPresenceScore),
        hiringActivityScore: Number(hiringActivityScore),
        techStackFitScore: Number(techStackFitScore),
        fundingRevenueScore: Number(fundingRevenueScore),
        projectUrgencyScore: Number(projectUrgencyScore),
        budgetClarityScore: Number(budgetClarityScore),
        recordedLeadScore: numRecordedScore,
      });

      addToast("Lead scoring dimensions updated successfully", "success");
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update scoring";
      setError(msg);
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const dimensions = [
    { label: "Digital Presence", value: digitalPresenceScore, setter: setDigitalPresenceScore, desc: "Website, social media, online activity (0–5)" },
    { label: "Hiring Activity", value: hiringActivityScore, setter: setHiringActivityScore, desc: "Active job postings & expansion (0–5)" },
    { label: "Tech Stack Fit", value: techStackFitScore, setter: setTechStackFitScore, desc: "Alignment with web solution stack (0–5)" },
    { label: "Funding / Revenue", value: fundingRevenueScore, setter: setFundingRevenueScore, desc: "Financial capacity & stability (0–5)" },
    { label: "Project Urgency", value: projectUrgencyScore, setter: setProjectUrgencyScore, desc: "Timeline priority & requirement (0–5)" },
    { label: "Budget Clarity", value: budgetClarityScore, setter: setBudgetClarityScore, desc: "Budget definition & readiness (0–5)" },
  ];

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Update Lead Scoring — ${companyName}`} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 text-xs bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 rounded border border-red-200">
            {error}
          </div>
        )}

        {/* Live Score Counter Card */}
        <div className="p-4 bg-muted/50 rounded-lg border border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-md text-primary">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Calculated Lead Score</div>
              <div className="text-xl font-bold text-foreground">
                {calculatedScore} <span className="text-xs text-muted-foreground font-normal">/ 30 points</span>
              </div>
            </div>
          </div>
          {hasDiscrepancy ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 rounded text-xs font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Differs by {discrepancyDiff} pts</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Aligned</span>
            </div>
          )}
        </div>

        {/* 6 Dimension Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dimensions.map((dim) => (
            <div key={dim.label} className="p-3 border border-border rounded-md bg-card space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-foreground">{dim.label}</label>
                <span className="text-xs font-bold text-primary">{dim.value} / 5</span>
              </div>
              <p className="text-[11px] text-muted-foreground">{dim.desc}</p>
              <input
                type="range"
                min={0}
                max={5}
                step={1}
                value={dim.value}
                onChange={(e) => dim.setter(Number(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          ))}
        </div>

        {/* Recorded Score Override Input */}
        <div className="p-3 border border-border rounded-md bg-card space-y-2">
          <Input
            label="Recorded Intake Lead Score (Optional)"
            type="number"
            min={0}
            max={30}
            placeholder="e.g. 18"
            value={recordedLeadScore}
            onChange={(e) => setRecordedLeadScore(e.target.value === "" ? "" : Number(e.target.value))}
            helperText="Raw score as originally recorded in external CRM dossier (0–30)."
          />
          {hasDiscrepancy && (
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 rounded border border-amber-200 dark:border-amber-800 text-xs">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Score Discrepancy Detected
              </p>
              <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-400">
                Calculated score ({calculatedScore}/30) differs from Recorded intake score ({numRecordedScore}/30) by <strong>{discrepancyDiff} points</strong>.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Save Scoring Changes
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
