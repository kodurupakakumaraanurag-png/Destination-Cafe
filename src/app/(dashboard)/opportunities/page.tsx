import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { OpportunitiesView } from "@/components/opportunities/opportunities-view";
import { getOpportunities } from "@/lib/actions/opportunity-actions";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sales Opportunities | Destination Cafe CRM",
  description: "Manage sales opportunities, pipeline values, deal stages, and project conversions.",
};

export default async function OpportunitiesPage() {
  let opportunities: Awaited<ReturnType<typeof getOpportunities>> = [];
  let leads: Array<{ id: string; company: string }> = [];
  let users: Array<{ id: string; name: string | null; email: string }> = [];

  try {
    opportunities = await getOpportunities();
    leads = await prisma.lead.findMany({
      where: { archivedAt: null },
      select: { id: true, company: true },
      orderBy: { company: "asc" },
    });
    users = await prisma.user.findMany({
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    });
  } catch (error: unknown) {
    console.error("Error loading opportunities page:", error);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Sales Opportunities Pipeline"
        description="Track commercial deals, estimated contract values, closing probabilities, and convert Won deals into Projects."
        badge={<Badge variant="outline">Opportunity Management</Badge>}
      />

      <OpportunitiesView
        initialOpportunities={opportunities}
        leads={leads}
        users={users}
      />
    </PageContainer>
  );
}
