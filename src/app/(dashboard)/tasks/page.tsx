import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { TasksView } from "@/components/tasks/tasks-view";
import { getTasks } from "@/lib/actions/task-actions";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tasks & Action Items | Destination Cafe CRM",
  description: "Operational task management, action item priorities, and due dates.",
};

export default async function TasksPage() {
  let tasks: Awaited<ReturnType<typeof getTasks>> = [];
  let leads: Array<{ id: string; company: string }> = [];
  let users: Array<{ id: string; name: string | null; email: string }> = [];

  try {
    tasks = await getTasks();
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
    console.error("Error loading tasks page:", error);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Tasks &amp; Action Items"
        description="Assigned follow-up tasks, priority deliverables, and operational action items connected to CRM leads."
        badge={<Badge variant="outline">Task Management</Badge>}
      />

      <TasksView initialTasks={tasks} leads={leads} users={users} />
    </PageContainer>
  );
}
