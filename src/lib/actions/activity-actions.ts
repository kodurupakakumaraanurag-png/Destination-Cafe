"use server";

import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/server-auth";
import { ActivityType, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface CreateActivityInput {
  leadId?: string;
  type: ActivityType;
  title: string;
  description?: string;
}

export async function getActivities(leadId?: string, typeFilter?: string, search?: string) {
  await requirePermission("VIEW_LEADS");

  const whereClause: Prisma.ActivityWhereInput = {};

  if (leadId) {
    whereClause.leadId = leadId;
  }

  if (typeFilter && typeFilter !== "ALL") {
    whereClause.type = typeFilter as ActivityType;
  }

  if (search && search.trim() !== "") {
    const q = search.trim();
    whereClause.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { lead: { company: { contains: q, mode: "insensitive" } } },
    ];
  }

  const activities = await prisma.activity.findMany({
    where: whereClause,
    include: {
      lead: {
        select: {
          id: true,
          company: true,
          domain: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return activities;
}

export async function createActivity(input: CreateActivityInput) {
  const session = await requirePermission("EDIT_LEADS");

  let leadCompany = "";
  if (input.leadId) {
    const lead = await prisma.lead.findUnique({
      where: { id: input.leadId },
      select: { company: true },
    });
    if (lead) leadCompany = lead.company;
  }

  const activity = await prisma.activity.create({
    data: {
      leadId: input.leadId || null,
      userId: session.user.id,
      type: input.type,
      title: input.title,
      description: input.description || null,
    },
    include: {
      lead: { select: { id: true, company: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  });

  // Create Audit Log
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "CREATE_ACTIVITY",
      entity: "Activity",
      entityId: activity.id,
      details: `Logged ${input.type} activity "${input.title}"${leadCompany ? ` for company "${leadCompany}"` : ""}`,
    },
  });

  revalidatePath("/crm/activities");
  revalidatePath("/activities");
  if (input.leadId) {
    revalidatePath(`/leads/${input.leadId}`);
    revalidatePath(`/crm/leads/${input.leadId}`);
  }

  return activity;
}
