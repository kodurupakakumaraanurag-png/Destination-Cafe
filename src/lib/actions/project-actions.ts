"use server";

import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/server-auth";
import { ProjectStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface CreateProjectInput {
  name: string;
  leadId?: string;
  opportunityId?: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: string;
  targetDate?: string;
  projectManagerId?: string;
  memberUserIds?: string[];
}

export interface UpdateProjectInput {
  name?: string;
  leadId?: string | null;
  opportunityId?: string | null;
  description?: string | null;
  status?: ProjectStatus;
  startDate?: string | null;
  targetDate?: string | null;
  projectManagerId?: string | null;
}

export async function getProjects(filter?: {
  status?: string;
  search?: string;
}) {
  await requirePermission("MANAGE_PROJECTS");

  const whereClause: Prisma.ProjectWhereInput = {};

  if (filter?.status && filter.status !== "ALL") {
    whereClause.status = filter.status as ProjectStatus;
  }

  if (filter?.search && filter.search.trim() !== "") {
    const q = filter.search.trim();
    whereClause.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { lead: { company: { contains: q, mode: "insensitive" } } },
    ];
  }

  const projects = await prisma.project.findMany({
    where: whereClause,
    include: {
      lead: {
        select: {
          id: true,
          company: true,
          domain: true,
        },
      },
      opportunity: {
        select: {
          id: true,
          name: true,
          value: true,
          stage: true,
        },
      },
      projectManager: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return projects;
}

export async function createProject(input: CreateProjectInput) {
  const session = await requirePermission("MANAGE_PROJECTS");

  let leadCompany = "";
  if (input.leadId) {
    const lead = await prisma.lead.findUnique({
      where: { id: input.leadId },
      select: { company: true },
    });
    if (lead) leadCompany = lead.company;
  }

  const parsedStart = input.startDate && input.startDate.trim() !== "" ? new Date(input.startDate) : null;
  const parsedTarget = input.targetDate && input.targetDate.trim() !== "" ? new Date(input.targetDate) : null;

  const projectManagerId = input.projectManagerId || session.user.id;

  const project = await prisma.project.create({
    data: {
      name: input.name,
      leadId: input.leadId || null,
      opportunityId: input.opportunityId || null,
      description: input.description || null,
      status: input.status || ProjectStatus.PLANNED,
      startDate: parsedStart,
      targetDate: parsedTarget,
      projectManagerId,
      members: {
        create: (input.memberUserIds || [projectManagerId]).map((userId) => ({
          userId,
          role: userId === projectManagerId ? "Project Manager" : "Team Member",
        })),
      },
    },
    include: {
      lead: { select: { id: true, company: true } },
      projectManager: { select: { id: true, name: true, email: true } },
    },
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "CREATE_PROJECT",
      entity: "Project",
      entityId: project.id,
      details: `Created project "${project.name}"${leadCompany ? ` for client "${leadCompany}"` : ""} (Status: ${project.status})`,
    },
  });

  if (input.leadId) {
    await prisma.activity.create({
      data: {
        leadId: input.leadId,
        userId: session.user.id,
        type: "SYSTEM_EVENT",
        title: `Project Created: ${project.name}`,
        description: `Project status: ${project.status}`,
      },
    });
  }

  revalidatePath("/projects");
  revalidatePath("/operations/projects");
  if (input.leadId) {
    revalidatePath(`/leads/${input.leadId}`);
  }

  return project;
}

export async function updateProject(id: string, input: UpdateProjectInput) {
  const session = await requirePermission("MANAGE_PROJECTS");

  const existing = await prisma.project.findUnique({
    where: { id },
    include: { lead: { select: { company: true } } },
  });

  if (!existing) {
    throw new Error("Project record not found.");
  }

  const parsedStart =
    input.startDate !== undefined ? (input.startDate ? new Date(input.startDate) : null) : existing.startDate;
  const parsedTarget =
    input.targetDate !== undefined ? (input.targetDate ? new Date(input.targetDate) : null) : existing.targetDate;

  const updated = await prisma.project.update({
    where: { id },
    data: {
      name: input.name ?? existing.name,
      leadId: input.leadId !== undefined ? input.leadId : existing.leadId,
      opportunityId: input.opportunityId !== undefined ? input.opportunityId : existing.opportunityId,
      description: input.description !== undefined ? input.description : existing.description,
      status: input.status ?? existing.status,
      startDate: parsedStart,
      targetDate: parsedTarget,
      projectManagerId: input.projectManagerId !== undefined ? input.projectManagerId : existing.projectManagerId,
    },
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "EDIT_PROJECT",
      entity: "Project",
      entityId: id,
      details: `Updated project "${updated.name}" (Status: ${updated.status})`,
    },
  });

  revalidatePath("/projects");
  revalidatePath("/operations/projects");
  if (existing.leadId) {
    revalidatePath(`/leads/${existing.leadId}`);
  }

  return updated;
}

export async function deleteProject(id: string) {
  const session = await requirePermission("MANAGE_PROJECTS");

  const existing = await prisma.project.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("Project not found.");
  }

  await prisma.project.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "DELETE_PROJECT",
      entity: "Project",
      entityId: id,
      details: `Deleted project "${existing.name}"`,
    },
  });

  revalidatePath("/projects");
  revalidatePath("/operations/projects");

  return { success: true };
}
