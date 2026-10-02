import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { PipelineBoard, PipelineLead } from "@/components/pipeline/pipeline-board";
import prisma from "@/lib/prisma";

export const metadata = {
  title: "CRM Pipeline | Destination Cafe CRM",
  description: "Visual Kanban deal pipeline and stage management.",
};

export default async function PipelinePage() {
  let leads: PipelineLead[] = [];
  let users: { id: string; name: string | null; email: string }[] = [];

  try {
    const rawLeads = await prisma.lead.findMany({
      where: { archivedAt: null },
      include: {
        assignedUser: { select: { id: true, name: true, email: true } },
        tasks: { select: { title: true, dueDate: true }, take: 1, orderBy: { dueDate: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    leads = rawLeads as unknown as PipelineLead[];

    users = await prisma.user.findMany({
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    });
  } catch (error: unknown) {
    console.error("Error fetching pipeline leads:", error);
    leads = [];
    users = [];
  }

  return (
    <PageContainer>
      <PageHeader
        title="CRM Pipeline"
        description="Visual Kanban deal board with drag-and-drop stage transitions, score tracking, and real-time audit logging."
        badge={<Badge variant="success">Kanban &amp; List View</Badge>}
      />

      <PipelineBoard initialLeads={leads} users={users} />
    </PageContainer>
  );
}
