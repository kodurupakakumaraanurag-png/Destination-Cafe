"use server";

import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/server-auth";
import { OpportunityStage, ProjectStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface CreateOpportunityInput {
  name: string;
  leadId: string;
  value?: number;
  stage?: OpportunityStage;
  probability?: number;
  closeDate?: string;
  assignedUserId?: string;
  notes?: string;
}

export interface UpdateOpportunityInput {
  name?: string;
  leadId?: string;
  value?: number | null;
  stage?: OpportunityStage;
  probability?: number | null;
  closeDate?: string | null;
  assignedUserId?: string | null;
  notes?: string | null;
}

export async function getOpportunities(filter?: {
  stage?: string;
  leadId?: string;
  search?: string;
}) {
  await requirePermission("MANAGE_OPPORTUNITIES");

  const whereClause: Prisma.OpportunityWhereInput = {};

  if (filter?.leadId) {
    whereClause.leadId = filter.leadId;
  }

  if (filter?.stage && filter.stage !== "ALL") {
    whereClause.stage = filter.stage as OpportunityStage;
  }

  if (filter?.search && filter.search.trim() !== "") {
    const q = filter.search.trim();
    whereClause.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { notes: { contains: q, mode: "insensitive" } },
      { lead: { company: { contains: q, mode: "insensitive" } } },
    ];
  }

  const opportunities = await prisma.opportunity.findMany({
    where: whereClause,
    include: {
      lead: {
        select: {
          id: true,
          company: true,
          domain: true,
          status: true,
        },
      },
      assignedUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      projects: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return opportunities;
}

export async function createOpportunity(input: CreateOpportunityInput) {
  const session = await requirePermission("MANAGE_OPPORTUNITIES");

  const lead = await prisma.lead.findUnique({
    where: { id: input.leadId },
    select: { company: true },
  });

  if (!lead) {
    throw new Error("Associated company/lead not found.");
  }

  const parsedCloseDate = input.closeDate && input.closeDate.trim() !== "" ? new Date(input.closeDate) : null;
  const initialStage = input.stage || OpportunityStage.QUALIFIED;

  const opportunity = await prisma.opportunity.create({
    data: {
      name: input.name,
      leadId: input.leadId,
      value: input.value !== undefined ? input.value : null,
      stage: initialStage,
      probability: input.probability !== undefined ? input.probability : 50,
      closeDate: parsedCloseDate,
      assignedUserId: input.assignedUserId || session.user.id,
      notes: input.notes || null,
    },
    include: {
      lead: { select: { id: true, company: true } },
      assignedUser: { select: { id: true, name: true, email: true } },
    },
  });

  // Create Audit Log
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "CREATE_OPPORTUNITY",
      entity: "Opportunity",
      entityId: opportunity.id,
      details: `Created opportunity "${opportunity.name}" for company "${lead.company}" (Stage: ${opportunity.stage}, Value: $${opportunity.value || 0})`,
    },
  });

  // Log activity on lead timeline
  await prisma.activity.create({
    data: {
      leadId: input.leadId,
      userId: session.user.id,
      type: "SYSTEM_EVENT",
      title: `Opportunity Created: ${opportunity.name}`,
      description: `Stage: ${opportunity.stage} | Est. Value: $${opportunity.value || 0}`,
    },
  });

  revalidatePath("/opportunities");
  revalidatePath("/operations/opportunities");
  revalidatePath(`/leads/${input.leadId}`);
  revalidatePath(`/crm/leads/${input.leadId}`);

  return opportunity;
}

export async function updateOpportunity(id: string, input: UpdateOpportunityInput) {
  const session = await requirePermission("MANAGE_OPPORTUNITIES");

  const existing = await prisma.opportunity.findUnique({
    where: { id },
    include: { lead: { select: { company: true } } },
  });

  if (!existing) {
    throw new Error("Opportunity record not found.");
  }

  const parsedCloseDate =
    input.closeDate !== undefined ? (input.closeDate ? new Date(input.closeDate) : null) : existing.closeDate;

  const updated = await prisma.opportunity.update({
    where: { id },
    data: {
      name: input.name ?? existing.name,
      leadId: input.leadId ?? existing.leadId,
      value: input.value !== undefined ? input.value : existing.value,
      stage: input.stage ?? existing.stage,
      probability: input.probability !== undefined ? input.probability : existing.probability,
      closeDate: parsedCloseDate,
      assignedUserId: input.assignedUserId !== undefined ? input.assignedUserId : existing.assignedUserId,
      notes: input.notes !== undefined ? input.notes : existing.notes,
    },
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "EDIT_OPPORTUNITY",
      entity: "Opportunity",
      entityId: id,
      details: `Updated opportunity "${updated.name}" (Stage: ${updated.stage}, Value: $${updated.value || 0})`,
    },
  });

  revalidatePath("/opportunities");
  revalidatePath("/operations/opportunities");
  revalidatePath(`/leads/${existing.leadId}`);
  revalidatePath(`/crm/leads/${existing.leadId}`);

  return updated;
}

export async function deleteOpportunity(id: string) {
  const session = await requirePermission("MANAGE_OPPORTUNITIES");

  const existing = await prisma.opportunity.findUnique({
    where: { id },
    include: { lead: { select: { company: true } } },
  });

  if (!existing) {
    throw new Error("Opportunity not found.");
  }

  await prisma.opportunity.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "DELETE_OPPORTUNITY",
      entity: "Opportunity",
      entityId: id,
      details: `Deleted opportunity "${existing.name}" (${existing.lead.company})`,
    },
  });

  revalidatePath("/opportunities");
  revalidatePath("/operations/opportunities");
  revalidatePath(`/leads/${existing.leadId}`);

  return { success: true };
}

export async function convertOpportunityToProject(opportunityId: string) {
  const session = await requirePermission("MANAGE_PROJECTS");

  const opportunity = await prisma.opportunity.findUnique({
    where: { id: opportunityId },
    include: {
      lead: { select: { id: true, company: true } },
      projects: true,
    },
  });

  if (!opportunity) {
    throw new Error("Opportunity not found.");
  }

  // Ensure stage is marked as WON
  if (opportunity.stage !== OpportunityStage.WON) {
    await prisma.opportunity.update({
      where: { id: opportunityId },
      data: { stage: OpportunityStage.WON, probability: 100 },
    });
  }

  // Create Project record
  const project = await prisma.project.create({
    data: {
      name: `${opportunity.lead.company} - ${opportunity.name}`,
      description: `Project initialized automatically from Won Opportunity "${opportunity.name}".\n\nNotes: ${opportunity.notes || "None"}`,
      leadId: opportunity.leadId,
      opportunityId: opportunity.id,
      status: ProjectStatus.PLANNED,
      projectManagerId: session.user.id,
      members: {
        create: {
          userId: session.user.id,
          role: "Project Manager",
        },
      },
    },
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "CONVERT_OPPORTUNITY_TO_PROJECT",
      entity: "Project",
      entityId: project.id,
      details: `Converted Won Opportunity "${opportunity.name}" into Project "${project.name}" for company "${opportunity.lead.company}"`,
    },
  });

  // Activity Log
  await prisma.activity.create({
    data: {
      leadId: opportunity.leadId,
      userId: session.user.id,
      type: "SYSTEM_EVENT",
      title: `Project Initialized: ${project.name}`,
      description: `Deal closed as WON. Project ${project.name} created.`,
    },
  });

  revalidatePath("/opportunities");
  revalidatePath("/operations/opportunities");
  revalidatePath("/projects");
  revalidatePath("/operations/projects");
  revalidatePath(`/leads/${opportunity.leadId}`);

  return project;
}
