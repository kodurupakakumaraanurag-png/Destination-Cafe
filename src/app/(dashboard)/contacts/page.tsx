import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { ContactsView } from "@/components/contacts/contacts-view";
import { getContacts } from "@/lib/actions/contact-actions";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Contacts Directory | Destination Cafe CRM",
  description: "Manage lead contacts, key decision makers, phone numbers, and designations.",
};

export default async function ContactsPage() {
  let contacts: Awaited<ReturnType<typeof getContacts>> = [];
  let leads: Array<{ id: string; company: string }> = [];

  try {
    contacts = await getContacts();
    leads = await prisma.lead.findMany({
      where: { archivedAt: null },
      select: { id: true, company: true },
      orderBy: { company: "asc" },
    });
  } catch (error: unknown) {
    console.error("Error loading contacts directory:", error);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Key Contacts Directory"
        description="Key stakeholders, primary decision makers, and company contact records."
        badge={<Badge variant="outline">Contacts Directory</Badge>}
      />

      <ContactsView initialContacts={contacts} leads={leads} />
    </PageContainer>
  );
}
