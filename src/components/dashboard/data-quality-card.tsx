import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataQualitySummary } from "@/lib/data/dashboard-data";
import { AlertTriangle, UserX, Globe, CheckCircle2 } from "lucide-react";

export function DataQualityCard({ data }: { data: DataQualitySummary }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Data Quality &amp; Intake Audit</span>
            </CardTitle>
            <CardDescription className="text-xs">
              System validation checks across lead completeness and scoring integrity.
            </CardDescription>
          </div>
          <Badge variant={data.scoreDiscrepancyCount > 0 ? "warning" : "success"}>
            {data.scoreDiscrepancyCount > 0 ? `${data.scoreDiscrepancyCount} Audit Alerts` : "Clean Data"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-secondary/60 border border-border space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Missing Contact Person</span>
              <UserX className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <p className="text-lg font-bold text-foreground">{data.missingContactPersonCount}</p>
          </div>

          <div className="p-3 rounded-lg bg-secondary/60 border border-border space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Missing Website URL</span>
              <Globe className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <p className="text-lg font-bold text-foreground">{data.missingWebsiteCount}</p>
          </div>

          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-1">
            <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-400 font-medium">
              <span>Score Discrepancies</span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <p className="text-lg font-bold text-amber-700 dark:text-amber-400">
              {data.scoreDiscrepancyCount}
            </p>
          </div>
        </div>

        {/* Detailed audit note for Destination Cafe dossier */}
        {data.scoreDiscrepancyCount > 0 && (
          <div className="p-3 rounded-md bg-card border border-amber-500/30 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Recorded vs Calculated Score Discrepancy Detected</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Destination Cafe record preserves <strong className="text-foreground">recordedLeadScore: 18</strong> from intake dossier while 6 score fields sum to <strong className="text-foreground">calculatedLeadScore: 0</strong>.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
