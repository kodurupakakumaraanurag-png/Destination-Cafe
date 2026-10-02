"use server";

import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/server-auth";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface CreateContactInput {
  leadId: string;
  name: string;
  designation?: string;
  phone?: string;
  email?: string;
  notes?: string;
  isPrimary?: boolean;
}

export interface UpdateContactInput {
  name?: string;
  designation?: string;
  phone?: string;
  email?: string;
  notes?: string;
  isPrimary?: boolean;
}

export async function getContacts(search?: string, leadId?: string) {
  await requirePermission("VIEW_LEADS");

  const whereClause: Prisma.ContactWhereInput = {};

  if (leadId) {
    whereClause.leadId = leadId;
  }

  if (search && search.trim() !== "") {
    const q = search.trim();
    whereClause.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
      { designation: { contains: q, mode: "insensitive" } },
      { lead: { company: { contains: q, mode: "insensitive" } } },
    ];
  }

  const contacts = await prisma.contact.findMany({
    where: whereClause,
    include: {
      lead: {
        select: {
          id: true,
          company: true,
          domain: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return contacts;
}

export async function createContact(input: CreateContactInput) {
  const session = await requirePermission("EDIT_LEADS");

  const lead = await prisma.lead.findUnique({
    where: { id: input.leadId },
    select: { company: true },
  });

  if (!lead) {
    throw new Error("Associated company/lead not found.");
  }

  // If this contact is marked as primary, unmark other contacts for this lead
  if (input.isPrimary) {
    await prisma.contact.updateMany({
      where: { leadId: input.leadId },
      data: { isPrimary: false },
    });
  }

  const contact = await prisma.contact.create({
    data: {
      leadId: input.leadId,
      name: input.name,
      designation: input.designation || null,
      phone: input.phone || null,
      email: input.email || null,
      notes: input.notes || null,
      isPrimary: input.isPrimary ?? false,
    },
  });

  // Create Audit Log
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "CREATE_CONTACT",
      entity: "Contact",
      entityId: contact.id,
      details: `Created contact ${input.name} for company "${lead.company}"`,
    },
  });

  revalidatePath("/contacts");
  revalidatePath("/crm/contacts");
  revalidatePath(`/leads/${input.leadId}`);
  revalidatePath(`/crm/leads/${input.leadId}`);

  return contact;
}

export async function updateContact(id: string, input: UpdateContactInput) {
  const session = await requirePermission("EDIT_LEADS");

  const existing = await prisma.contact.findUnique({
    where: { id },
    include: { lead: { select: { company: true } } },
  });

  if (!existing) {
    throw new Error("Contact record not found.");
  }

  if (input.isPrimary) {
    await prisma.contact.updateMany({
      where: { leadId: existing.leadId },
      data: { isPrimary: false },
    });
  }

  const updated = await prisma.contact.update({
    where: { id },
    data: {
      name: input.name ?? existing.name,
      designation: input.designation !== undefined ? input.designation : existing.designation,
      phone: input.phone !== undefined ? input.phone : existing.phone,
      email: input.email !== undefined ? input.email : existing.email,
      notes: input.notes !== undefined ? input.notes : existing.notes,
      isPrimary: input.isPrimary !== undefined ? input.isPrimary : existing.isPrimary,
    },
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "EDIT_CONTACT",
      entity: "Contact",
      entityId: id,
      details: `Updated contact details for ${updated.name || "Contact"} (${existing.lead.company})`,
    },
  });

  revalidatePath("/contacts");
  revalidatePath("/crm/contacts");
  revalidatePath(`/leads/${existing.leadId}`);
  revalidatePath(`/crm/leads/${existing.leadId}`);

  return updated;
}

export async function deleteContact(id: string) {
  const session = await requirePermission("EDIT_LEADS");

  const existing = await prisma.contact.findUnique({
    where: { id },
    include: { lead: { select: { company: true } } },
  });

  if (!existing) {
    throw new Error("Contact not found.");
  }

  await prisma.contact.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "DELETE_CONTACT",
      entity: "Contact",
      entityId: id,
      details: `Deleted contact ${existing.name || id} from company "${existing.lead.company}"`,
    },
  });

  revalidatePath("/contacts");
  revalidatePath("/crm/contacts");
  revalidatePath(`/leads/${existing.leadId}`);
  revalidatePath(`/crm/leads/${existing.leadId}`);

  return { success: true };
}
