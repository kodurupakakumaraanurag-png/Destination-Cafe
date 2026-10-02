import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getImportBatches, ImportBatchWithErrors } from "@/lib/actions/import-actions";
import Link from "next/link";
import { History, FileSpreadsheet, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Import History & Error Logs | Destination Cafe CRM",
  description: "Audit past batch imports, row success counts, and error reports.",
};

export default async function ImportHistoryPage() {
  let batches: ImportBatchWithErrors[] = [];

  try {
    batches = await getImportBatches();
  } catch (error: unknown) {
    console.error("Error loading import batch history:", error);
    batches = [];
  }

  return (
    <PageContainer>
      <PageHeader
        title="Import History &amp; Error Logs"
        description="Audit historical CSV batch imports, row success rates, and row error diagnostics."
        badge={<Badge variant="outline">Batch Logs</Badge>}
        actions={
          <Link href="/imports">
            <Button size="sm">
              <FileSpreadsheet className="w-4 h-4 mr-1.5" /> New Batch Import
            </Button>
          </Link>
        }
      />

      <div className="space-y-6">
        <Card>
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              Historical Batch Import Log ({batches.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {batches.length === 0 ? (
              <div className="text-center py-12 text-xs text-muted-foreground">
                No past batch imports recorded yet. Click &quot;New Batch Import&quot; to run your first ingestion.
              </div>
            ) : (
              <div className="space-y-4">
                {batches.map((batch) => (
                  <div key={batch.id} className="p-4 rounded-lg border border-border bg-card space-y-3 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-md bg-primary/10 text-primary">
                          <FileSpreadsheet className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-foreground flex items-center gap-2">
                            <span>{batch.fileName}</span>
                            <Badge variant={batch.status === "COMPLETED" ? "success" : "secondary"}>
                              {batch.status}
                            </Badge>
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            Batch ID: <span className="font-mono">{batch.id}</span> | Imported on {new Date(batch.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-medium">
                        <div>
                          <span className="text-muted-foreground block text-[10px]">SUCCESS</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">{batch.successRows} rows</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px]">FAILED</span>
                          <span className="text-red-600 dark:text-red-400 font-bold">{batch.failedRows} rows</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px]">TOTAL</span>
                          <span className="font-bold text-foreground">{batch.totalRows} rows</span>
                        </div>
                      </div>
                    </div>

                    {/* Error logs detail */}
                    {batch.errors && batch.errors.length > 0 && (
                      <div className="p-3 bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-md space-y-2">
                        <div className="font-bold text-[11px] text-red-700 dark:text-red-300 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Import Errors Recorded ({batch.errors.length})
                        </div>
                        <div className="space-y-1">
                          {batch.errors.map((err) => (
                            <div key={err.id} className="text-[11px] text-red-600 dark:text-red-400 flex items-start gap-2">
                              <span className="font-mono font-bold shrink-0">Row {err.rowNumber}:</span>
                              <span>{err.errorMessage}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
