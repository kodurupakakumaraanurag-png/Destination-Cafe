"use server";

import prisma from "@/lib/prisma";
import {
  leadFormSchema,
  LeadFormValues,
  scoringFormSchema,
  ScoringFormValues,
  activityFormSchema,
  ActivityFormValues,
  taskFormSchema,
  TaskFormValues,
} from "@/lib/validations/lead";
import { requirePermission } from "@/lib/server-auth";
import { Priority, LeadStatus, Prisma, ActivityType, TaskStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface GetLeadsParams {
  search?: string;
  status?: string;
  priority?: string;
  source?: string;
  contactMethod?: string;
  assignedUserId?: string;
  minScore?: number;
  maxScore?: number;
  sortBy?: "company" | "dateAdded" | "calculatedLeadScore" | "createdAt" | "priority";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
  includeArchived?: boolean;
}

export async function getLeads(params: GetLeadsParams = {}) {
  await requirePermission("VIEW_LEADS");

  const {
    search,
    status,
    priority,
    source,
    contactMethod,
    assignedUserId,
    minScore,
    maxScore,
    sortBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    pageSize = 10,
    includeArchived = false,
  } = params;

  try {
    const where: Prisma.LeadWhereInput = {};

    if (!includeArchived) {
      where.archivedAt = null;
    }

    if (search) {
      const term = search.trim();
      where.OR = [
        { company: { contains: term, mode: "insensitive" } },
        { domain: { contains: term, mode: "insensitive" } },
        { location: { contains: term, mode: "insensitive" } },
        { contactPerson: { contains: term, mode: "insensitive" } },
        { email: { contains: term, mode: "insensitive" } },
        { phone: { contains: term, mode: "insensitive" } },
      ];
    }

    if (status && status !== "ALL") {
      where.status = status as LeadStatus;
    }

    if (priority && priority !== "ALL") {
      where.priority = priority as Priority;
    }

    if (source && source !== "ALL") {
      where.source = source;
    }

    if (contactMethod && contactMethod !== "ALL") {
      where.contactMethod = contactMethod;
    }

    if (assignedUserId && assignedUserId !== "ALL") {
      where.assignedUserId = assignedUserId;
    }

    if (minScore !== undefined || maxScore !== undefined) {
      where.OR = [
        {
          calculatedLeadScore: {
            gte: minScore ?? 0,
            lte: maxScore ?? 30,
          },
        },
        {
          recordedLeadScore: {
            gte: minScore ?? 0,
            lte: maxScore ?? 30,
          },
        },
      ];
    }

    const totalCount = await prisma.lead.count({ where });
    const leads = await prisma.lead.findMany({
      where,
      include: {
        assignedUser: { select: { id: true, name: true, email: true } },
        activities: { orderBy: { createdAt: "desc" }, take: 1 },
        tasks: { orderBy: { dueDate: "asc" }, take: 1 },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      leads,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
      pageSize,
    };
  } catch (error: unknown) {
    console.error("Error fetching leads:", error);
    throw new Error("Failed to fetch leads database records.");
  }
}

export async function getLeadById(id: string) {
  await requirePermission("VIEW_LEADS");

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      assignedUser: true,
      contacts: true,
      leadScores: { orderBy: { createdAt: "desc" } },
      activities: { include: { user: true }, orderBy: { createdAt: "desc" } },
      tasks: { include: { assignedUser: true }, orderBy: { dueDate: "asc" } },
      opportunities: true,
      projects: true,
    },
  });

  if (!lead) {
    throw new Error("Lead record not found.");
  }

  return lead;
}

export async function createLead(rawValues: LeadFormValues) {
  const session = await requirePermission("CREATE_LEADS");

  // Validate server-side with Zod
  const validated = leadFormSchema.parse(rawValues);

  // Compute calculatedLeadScore from the 6 dimensional score fields
  const calculatedLeadScore =
    (validated.digitalPresenceScore || 0) +
    (validated.hiringActivityScore || 0) +
    (validated.techStackFitScore || 0) +
    (validated.fundingRevenueScore || 0) +
    (validated.projectUrgencyScore || 0) +
    (validated.budgetClarityScore || 0);

  const lead = await prisma.lead.create({
    data: {
      company: validated.company,
      domain: validated.domain || null,
      location: validated.location || null,
      website: validated.website || null,
      contactPerson: validated.contactPerson || null,
      designation: validated.designation || null,
      phone: validated.phone || null,
      email: validated.email || null,
      businessUnderstanding: validated.businessUnderstanding || null,
      possibleProblem: validated.possibleProblem || null,
      requirement: validated.requirement || null,
      opportunity: validated.opportunity || null,
      priority: validated.priority,
      status: validated.status,
      nextAction: validated.nextAction || null,
      dateAdded: validated.dateAdded ? new Date(validated.dateAdded) : new Date(),
      source: validated.source || null,
      contactMethod: validated.contactMethod || null,
      digitalPresenceScore: validated.digitalPresenceScore,
      hiringActivityScore: validated.hiringActivityScore,
      techStackFitScore: validated.techStackFitScore,
      fundingRevenueScore: validated.fundingRevenueScore,
      projectUrgencyScore: validated.projectUrgencyScore,
      budgetClarityScore: validated.budgetClarityScore,
      recordedLeadScore: validated.recordedLeadScore ?? null,
      calculatedLeadScore,
      projectAllocationStatus: validated.projectAllocationStatus,
      assignedUserId: validated.assignedUserId || null,
      contacts: validated.contactPerson
        ? {
            create: {
              name: validated.contactPerson,
              designation: validated.designation || null,
              phone: validated.phone || null,
              email: validated.email || null,
              isPrimary: true,
            },
          }
        : undefined,
      leadScores: {
        create: {
          digitalPresenceScore: validated.digitalPresenceScore,
          hiringActivityScore: validated.hiringActivityScore,
          techStackFitScore: validated.techStackFitScore,
          fundingRevenueScore: validated.fundingRevenueScore,
          projectUrgencyScore: validated.projectUrgencyScore,
          budgetClarityScore: validated.budgetClarityScore,
          recordedLeadScore: validated.recordedLeadScore ?? null,
          calculatedLeadScore,
        },
      },
      activities: {
        create: {
          userId: session.user.id,
          type: "SYSTEM_EVENT",
          title: "Lead Created",
          description: `Created lead for ${validated.company} with calculated score ${calculatedLeadScore}.`,
        },
      },
    },
  });

  // Create Audit Log
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "CREATE_LEAD",
      entity: "Lead",
      entityId: lead.id,
      details: `Created lead record for ${lead.company} (${lead.status}).`,
    },
  });

  revalidatePath("/crm/leads");
  return lead;
}

export async function updateLead(id: string, rawValues: LeadFormValues) {
  const session = await requirePermission("EDIT_LEADS");

  // Validate server-side with Zod
  const validated = leadFormSchema.parse(rawValues);

  const calculatedLeadScore =
    (validated.digitalPresenceScore || 0) +
    (validated.hiringActivityScore || 0) +
    (validated.techStackFitScore || 0) +
    (validated.fundingRevenueScore || 0) +
    (validated.projectUrgencyScore || 0) +
    (validated.budgetClarityScore || 0);

  const updatedLead = await prisma.lead.update({
    where: { id },
    data: {
      company: validated.company,
      domain: validated.domain || null,
      location: validated.location || null,
      website: validated.website || null,
      contactPerson: validated.contactPerson || null,
      designation: validated.designation || null,
      phone: validated.phone || null,
      email: validated.email || null,
      businessUnderstanding: validated.businessUnderstanding || null,
      possibleProblem: validated.possibleProblem || null,
      requirement: validated.requirement || null,
      opportunity: validated.opportunity || null,
      priority: validated.priority,
      status: validated.status,
      nextAction: validated.nextAction || null,
      dateAdded: validated.dateAdded ? new Date(validated.dateAdded) : undefined,
      source: validated.source || null,
      contactMethod: validated.contactMethod || null,
      digitalPresenceScore: validated.digitalPresenceScore,
      hiringActivityScore: validated.hiringActivityScore,
      techStackFitScore: validated.techStackFitScore,
      fundingRevenueScore: validated.fundingRevenueScore,
      projectUrgencyScore: validated.projectUrgencyScore,
      budgetClarityScore: validated.budgetClarityScore,
      recordedLeadScore: validated.recordedLeadScore ?? null,
      calculatedLeadScore,
      projectAllocationStatus: validated.projectAllocationStatus,
      assignedUserId: validated.assignedUserId || null,
      activities: {
        create: {
          userId: session.user.id,
          type: "SYSTEM_EVENT",
          title: "Lead Updated",
          description: `Updated lead details for ${validated.company}.`,
        },
      },
    },
  });

  // Create Audit Log
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "UPDATE_LEAD",
      entity: "Lead",
      entityId: updatedLead.id,
      details: `Updated lead record for ${updatedLead.company}.`,
    },
  });

  revalidatePath("/crm/leads");
  return updatedLead;
}

export async function archiveLead(id: string) {
  const session = await requirePermission("ARCHIVE_LEADS");

  const archivedLead = await prisma.lead.update({
    where: { id },
    data: {
      archivedAt: new Date(),
      status: LeadStatus.ARCHIVED,
      activities: {
        create: {
          userId: session.user.id,
          type: "SYSTEM_EVENT",
          title: "Lead Archived",
          description: "Archived lead record.",
        },
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "ARCHIVE_LEAD",
      entity: "Lead",
      entityId: id,
      details: `Archived lead ${archivedLead.company}.`,
    },
  });

  revalidatePath("/crm/leads");
  revalidatePath(`/leads/${id}`);
  revalidatePath(`/crm/leads/${id}`);
  return archivedLead;
}

export async function updateLeadScoring(id: string, rawValues: ScoringFormValues) {
  const session = await requirePermission("MANAGE_SCORING");

  const validated = scoringFormSchema.parse(rawValues);

  const calculatedLeadScore =
    (validated.digitalPresenceScore || 0) +
    (validated.hiringActivityScore || 0) +
    (validated.techStackFitScore || 0) +
    (validated.fundingRevenueScore || 0) +
    (validated.projectUrgencyScore || 0) +
    (validated.budgetClarityScore || 0);

  const updatedLead = await prisma.lead.update({
    where: { id },
    data: {
      digitalPresenceScore: validated.digitalPresenceScore,
      hiringActivityScore: validated.hiringActivityScore,
      techStackFitScore: validated.techStackFitScore,
      fundingRevenueScore: validated.fundingRevenueScore,
      projectUrgencyScore: validated.projectUrgencyScore,
      budgetClarityScore: validated.budgetClarityScore,
      calculatedLeadScore,
      recordedLeadScore: validated.recordedLeadScore ?? null,
      leadScores: {
        create: {
          digitalPresenceScore: validated.digitalPresenceScore,
          hiringActivityScore: validated.hiringActivityScore,
          techStackFitScore: validated.techStackFitScore,
          fundingRevenueScore: validated.fundingRevenueScore,
          projectUrgencyScore: validated.projectUrgencyScore,
          budgetClarityScore: validated.budgetClarityScore,
          calculatedLeadScore,
          recordedLeadScore: validated.recordedLeadScore ?? null,
        },
      },
      activities: {
        create: {
          userId: session.user.id,
          type: ActivityType.SYSTEM_EVENT,
          title: "Scoring Dimensions Updated",
          description: `Updated score dimensions. Recalculated score: ${calculatedLeadScore}/30.`,
        },
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "UPDATE_LEAD_SCORE",
      entity: "Lead",
      entityId: id,
      details: `Updated scoring dimensions for ${updatedLead.company}. Calculated score: ${calculatedLeadScore}/30, Recorded score: ${validated.recordedLeadScore ?? "None"}.`,
    },
  });

  revalidatePath("/crm/leads");
  revalidatePath(`/leads/${id}`);
  revalidatePath(`/crm/leads/${id}`);
  return updatedLead;
}

export async function addLeadActivity(leadId: string, rawValues: ActivityFormValues) {
  const session = await requirePermission("EDIT_LEADS");

  const validated = activityFormSchema.parse(rawValues);

  const activity = await prisma.activity.create({
    data: {
      leadId,
      userId: session.user.id,
      type: validated.type as ActivityType,
      title: validated.title,
      description: validated.description || null,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "ADD_ACTIVITY",
      entity: "Lead",
      entityId: leadId,
      details: `Logged ${validated.type} activity: ${validated.title}`,
    },
  });

  revalidatePath(`/leads/${leadId}`);
  revalidatePath(`/crm/leads/${leadId}`);
  return activity;
}

export async function addLeadTask(leadId: string, rawValues: TaskFormValues) {
  const session = await requirePermission("MANAGE_TASKS");

  const validated = taskFormSchema.parse(rawValues);

  const task = await prisma.task.create({
    data: {
      leadId,
      title: validated.title,
      description: validated.description || null,
      priority: validated.priority,
      dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
      assignedUserId: validated.assignedUserId || null,
      status: TaskStatus.PENDING,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "ADD_TASK",
      entity: "Lead",
      entityId: leadId,
      details: `Added task: ${validated.title} (${validated.priority})`,
    },
  });

  revalidatePath(`/leads/${leadId}`);
  revalidatePath(`/crm/leads/${leadId}`);
  return task;
}

export async function toggleTaskStatus(taskId: string, currentStatus: TaskStatus, leadId?: string) {
  const session = await requirePermission("MANAGE_TASKS");

  const newStatus = currentStatus === TaskStatus.COMPLETED ? TaskStatus.PENDING : TaskStatus.COMPLETED;

  const task = await prisma.task.update({
    where: { id: taskId },
    data: { status: newStatus },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "UPDATE_TASK_STATUS",
      entity: "Task",
      entityId: taskId,
      details: `Task status updated to ${newStatus}`,
    },
  });

  if (leadId) {
    revalidatePath(`/leads/${leadId}`);
    revalidatePath(`/crm/leads/${leadId}`);
  }
  return task;
}

export async function getLeadAuditLogs(leadId: string) {
  await requirePermission("VIEW_LEADS");

  try {
    const logs = await prisma.auditLog.findMany({
      where: {
        OR: [
          { entityId: leadId },
          { details: { contains: leadId } },
        ],
      },
      include: {
        user: { select: { name: true, email: true, userRole: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return logs;
  } catch (error: unknown) {
    console.error("Error fetching audit logs for lead:", error);
    return [];
  }
}

export async function updateLeadStage(id: string, newStatus: LeadStatus) {
  const session = await requirePermission("EDIT_LEADS");

  const existingLead = await prisma.lead.findUnique({
    where: { id },
    select: { id: true, company: true, status: true },
  });

  if (!existingLead) {
    throw new Error("Lead not found.");
  }

  const oldStatus = existingLead.status;
  if (oldStatus === newStatus) return existingLead;

  const updatedLead = await prisma.lead.update({
    where: { id },
    data: {
      status: newStatus,
      activities: {
        create: {
          userId: session.user.id,
          type: ActivityType.SYSTEM_EVENT,
          title: "Pipeline Stage Updated",
          description: `Moved lead "${existingLead.company}" from stage ${oldStatus.replace(/_/g, " ")} to ${newStatus.replace(/_/g, " ")}.`,
        },
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "UPDATE_LEAD_STAGE",
      entity: "Lead",
      entityId: id,
      details: `Moved lead ${existingLead.company} from stage ${oldStatus} to ${newStatus}.`,
    },
  });

  revalidatePath("/pipeline");
  revalidatePath("/crm/pipeline");
  revalidatePath("/crm/leads");
  revalidatePath(`/leads/${id}`);
  revalidatePath(`/crm/leads/${id}`);
  return updatedLead;
}
