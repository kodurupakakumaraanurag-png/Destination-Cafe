"use server";

import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/server-auth";
import { TaskStatus, Priority } from "@prisma/client";

export interface FollowUpItem {
  id: string;
  title: string;
  description?: string | null;
  dueDate: Date;
  status: TaskStatus;
  priority: Priority;
  leadId?: string | null;
  leadCompany?: string | null;
  leadDomain?: string | null;
  assignedUserName?: string | null;
  isOverdue: boolean;
  isToday: boolean;
}

export async function getFollowUps() {
  await requirePermission("MANAGE_TASKS");

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  // Fetch all incomplete tasks that have a due date
  const tasks = await prisma.task.findMany({
    where: {
      status: { not: TaskStatus.COMPLETED },
      dueDate: { not: null },
    },
    include: {
      lead: {
        select: { id: true, company: true, domain: true },
      },
      assignedUser: {
        select: { name: true, email: true },
      },
    },
    orderBy: { dueDate: "asc" },
  });

  const overdue: FollowUpItem[] = [];
  const today: FollowUpItem[] = [];
  const upcoming: FollowUpItem[] = [];

  for (const task of tasks) {
    if (!task.dueDate) continue;

    const due = new Date(task.dueDate);
    const isOverdue = due < startOfToday;
    const isToday = due >= startOfToday && due <= endOfToday;

    const item: FollowUpItem = {
      id: task.id,
      title: task.title,
      description: task.description,
      dueDate: due,
      status: task.status,
      priority: task.priority,
      leadId: task.leadId,
      leadCompany: task.lead?.company,
      leadDomain: task.lead?.domain,
      assignedUserName: task.assignedUser?.name || task.assignedUser?.email,
      isOverdue,
      isToday,
    };

    if (isOverdue) {
      overdue.push(item);
    } else if (isToday) {
      today.push(item);
    } else {
      upcoming.push(item);
    }
  }

  // Also include leads with nextAction specified if applicable
  const leadsWithNextAction = await prisma.lead.findMany({
    where: {
      archivedAt: null,
      nextAction: { not: null },
    },
    select: {
      id: true,
      company: true,
      domain: true,
      nextAction: true,
      dateAdded: true,
      priority: true,
      assignedUser: { select: { name: true, email: true } },
    },
  });

  return {
    today,
    upcoming,
    overdue,
    leadsWithNextAction,
  };
}
