import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { ImportWorkflow } from "@/components/imports/import-workflow";
import { getExistingLeadIdentifiers } from "@/lib/actions/import-actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "CSV Ingestion & Validation | Destination Cafe CRM",
  description: "Bulk import 26-column CRM intake spreadsheets with validation and security checks.",
};

export default async function ImportsPage() {
  let companies: string[] = [];
  let emails: string[] = [];

  try {
    const idents = await getExistingLeadIdentifiers();
    companies = idents.companies;
    emails = idents.emails;
  } catch (error: unknown) {
    console.error("Error fetching existing lead identifiers for import:", error);
  }

  return (
    <PageContainer>
      <PageHeader
        title="CSV Lead Ingestion Workflow"
        description="Upload, validate 26-column intake schema, check formula security, audit duplicates, and execute bulk batch imports."
        badge={<Badge variant="success">26-Column Ingestion Active</Badge>}
      />

      <ImportWorkflow existingCompanies={companies} existingEmails={emails} />
    </PageContainer>
  );
}
