import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { ProjectsView } from "@/components/projects/projects-view";
import { getProjects } from "@/lib/actions/project-actions";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Projects Portfolio | Destination Cafe CRM",
  description: "Manage client projects, project status, timelines, project managers, and team members.",
};

export default async function ProjectsPage() {
  let projects: Awaited<ReturnType<typeof getProjects>> = [];
  let leads: Array<{ id: string; company: string }> = [];
  let users: Array<{ id: string; name: string | null; email: string }> = [];

  try {
    projects = await getProjects();
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
    console.error("Error loading projects portfolio:", error);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Client Projects Portfolio"
        description="Monitor active client deployments, delivery timelines, project managers, and team member assignments."
        badge={<Badge variant="outline">Project Management</Badge>}
      />

      <ProjectsView
        initialProjects={projects}
        leads={leads}
        users={users}
      />
    </PageContainer>
  );
}
