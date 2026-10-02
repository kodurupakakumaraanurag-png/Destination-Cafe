import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { DataQualityView } from "@/components/analytics/data-quality-view";
import { auditSystemDataQuality, MinimalLead } from "@/lib/data-quality";
import prisma from "@/lib/prisma";

export const metadata = {
  title: "Data Quality & Discrepancies | Destination Cafe CRM",
  description: "Audit CRM intake data gaps, missing contacts, score discrepancies, and field health.",
};

export default async function DataQualityPage() {
  let leads: MinimalLead[] = [];

  try {
    const rawLeads = await prisma.lead.findMany({
      where: { archivedAt: null },
      orderBy: { createdAt: "desc" },
    });
    leads = rawLeads as unknown as MinimalLead[];
  } catch (error: unknown) {
    console.error("Error fetching leads for data quality audit:", error);
    leads = [];
  }

  const summary = auditSystemDataQuality(leads);

  return (
    <PageContainer>
      <PageHeader
        title="Data Quality &amp; Discrepancies Audit"
        description="Comprehensive evaluation engine auditing intake completeness, missing POC details, formatting rules, and lead score discrepancies."
        badge={<Badge variant="success">Quality Engine Active</Badge>}
      />

      <DataQualityView summary={summary} />
    </PageContainer>
  );
}
