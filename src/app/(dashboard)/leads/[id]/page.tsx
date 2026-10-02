import { getLeadById, getLeadAuditLogs } from "@/lib/actions/lead-actions";
import { LeadDetailView } from "@/components/leads/lead-detail-view";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { LeadDetailRecord, LeadAuditLog, LeadUser } from "@/types/lead-detail";

export const metadata = {
  title: "Lead Details | Destination Cafe CRM",
  description: "Detailed CRM lead view, scoring engine breakdown, and activity history.",
};

interface LeadDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params;

  let lead: LeadDetailRecord | null = null;
  let auditLogs: LeadAuditLog[] = [];
  let users: LeadUser[] = [];

  try {
    const rawLead = await getLeadById(id);
    lead = rawLead as unknown as LeadDetailRecord;
    const rawLogs = await getLeadAuditLogs(id);
    auditLogs = rawLogs as unknown as LeadAuditLog[];
    users = await prisma.user.findMany({
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    });
  } catch (error: unknown) {
    console.error(`Error loading lead ${id}:`, error);
    notFound();
  }

  if (!lead) {
    notFound();
  }

  return (
    <LeadDetailPageWrapper lead={lead} auditLogs={auditLogs} users={users} />
  );
}

function LeadDetailPageWrapper({
  lead,
  auditLogs,
  users,
}: {
  lead: LeadDetailRecord;
  auditLogs: LeadAuditLog[];
  users: LeadUser[];
}) {
  return <LeadDetailView lead={lead} auditLogs={auditLogs} users={users} />;
}
