"use server";

import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/server-auth";
import { Priority, TaskStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: string;
  leadId?: string;
  assignedUserId?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: string | null;
  leadId?: string | null;
  assignedUserId?: string | null;
}

export async function getTasks(filter?: {
  status?: string;
  priority?: string;
  leadId?: string;
  assignedUserId?: string;
  search?: string;
}) {
  await requirePermission("MANAGE_TASKS");

  const whereClause: Prisma.TaskWhereInput = {};

  if (filter?.leadId) {
    whereClause.leadId = filter.leadId;
  }

  if (filter?.assignedUserId) {
    whereClause.assignedUserId = filter.assignedUserId;
  }

  if (filter?.priority && filter.priority !== "ALL") {
    whereClause.priority = filter.priority as Priority;
  }

  if (filter?.status && filter.status !== "ALL") {
    if (filter.status === "OVERDUE") {
      whereClause.status = { not: TaskStatus.COMPLETED };
      whereClause.dueDate = { lt: new Date() };
    } else {
      whereClause.status = filter.status as TaskStatus;
    }
  }

  if (filter?.search && filter.search.trim() !== "") {
    const q = filter.search.trim();
    whereClause.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { lead: { company: { contains: q, mode: "insensitive" } } },
    ];
  }

  const tasks = await prisma.task.findMany({
    where: whereClause,
    include: {
      lead: {
        select: {
          id: true,
          company: true,
          domain: true,
        },
      },
      assignedUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: [
      { dueDate: "asc" },
      { createdAt: "desc" },
    ],
  });

  return tasks;
}

export async function createTask(input: CreateTaskInput) {
  const session = await requirePermission("MANAGE_TASKS");

  let leadCompany = "";
  if (input.leadId) {
    const lead = await prisma.lead.findUnique({
      where: { id: input.leadId },
      select: { company: true },
    });
    if (lead) leadCompany = lead.company;
  }

  const parsedDueDate = input.dueDate && input.dueDate.trim() !== "" ? new Date(input.dueDate) : null;
  const initialStatus = input.status || TaskStatus.TODO;

  const task = await prisma.task.create({
    data: {
      title: input.title,
      description: input.description || null,
      status: initialStatus,
      priority: input.priority || Priority.MEDIUM,
      dueDate: parsedDueDate,
      leadId: input.leadId || null,
      assignedUserId: input.assignedUserId || session.user.id,
    },
    include: {
      lead: { select: { id: true, company: true } },
      assignedUser: { select: { id: true, name: true, email: true } },
    },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "CREATE_TASK",
      entity: "Task",
      entityId: task.id,
      details: `Created task "${input.title}" with priority ${task.priority}${leadCompany ? ` for company "${leadCompany}"` : ""}`,
    },
  });

  // If associated with lead, create an Activity log as well
  if (input.leadId) {
    await prisma.activity.create({
      data: {
        leadId: input.leadId,
        userId: session.user.id,
        type: "FOLLOW_UP",
        title: `Task Created: ${input.title}`,
        description: `Priority: ${task.priority} | Due: ${parsedDueDate ? parsedDueDate.toLocaleDateString() : "Unscheduled"}`,
      },
    });
  }

  revalidatePath("/tasks");
  revalidatePath("/operations/tasks");
  revalidatePath("/operations/follow-ups");
  if (input.leadId) {
    revalidatePath(`/leads/${input.leadId}`);
    revalidatePath(`/crm/leads/${input.leadId}`);
  }

  return task;
}

export async function updateTask(id: string, input: UpdateTaskInput) {
  const session = await requirePermission("MANAGE_TASKS");

  const existing = await prisma.task.findUnique({
    where: { id },
    include: { lead: { select: { company: true } } },
  });

  if (!existing) {
    throw new Error("Task not found.");
  }

  const parsedDueDate = input.dueDate !== undefined ? (input.dueDate ? new Date(input.dueDate) : null) : existing.dueDate;

  const updated = await prisma.task.update({
    where: { id },
    data: {
      title: input.title ?? existing.title,
      description: input.description !== undefined ? input.description : existing.description,
      status: input.status ?? existing.status,
      priority: input.priority ?? existing.priority,
      dueDate: parsedDueDate,
      leadId: input.leadId !== undefined ? input.leadId : existing.leadId,
      assignedUserId: input.assignedUserId !== undefined ? input.assignedUserId : existing.assignedUserId,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "EDIT_TASK",
      entity: "Task",
      entityId: id,
      details: `Updated task "${updated.title}" (Status: ${updated.status}, Priority: ${updated.priority})`,
    },
  });

  revalidatePath("/tasks");
  revalidatePath("/operations/tasks");
  revalidatePath("/operations/follow-ups");
  if (existing.leadId) {
    revalidatePath(`/leads/${existing.leadId}`);
    revalidatePath(`/crm/leads/${existing.leadId}`);
  }

  return updated;
}

export async function toggleTaskComplete(id: string) {
  const session = await requirePermission("MANAGE_TASKS");

  const existing = await prisma.task.findUnique({
    where: { id },
    include: { lead: { select: { id: true, company: true } } },
  });

  if (!existing) {
    throw new Error("Task not found.");
  }

  const newStatus = existing.status === TaskStatus.COMPLETED ? TaskStatus.TODO : TaskStatus.COMPLETED;

  const updated = await prisma.task.update({
    where: { id },
    data: { status: newStatus },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "COMPLETE_TASK",
      entity: "Task",
      entityId: id,
      details: `Marked task "${existing.title}" as ${newStatus}`,
    },
  });

  if (existing.leadId && newStatus === TaskStatus.COMPLETED) {
    await prisma.activity.create({
      data: {
        leadId: existing.leadId,
        userId: session.user.id,
        type: "FOLLOW_UP",
        title: `Task Completed: ${existing.title}`,
        description: `Task marked as COMPLETED by ${session.user.name || session.user.email}`,
      },
    });
  }

  revalidatePath("/tasks");
  revalidatePath("/operations/tasks");
  revalidatePath("/operations/follow-ups");
  if (existing.leadId) {
    revalidatePath(`/leads/${existing.leadId}`);
    revalidatePath(`/crm/leads/${existing.leadId}`);
  }

  return updated;
}
