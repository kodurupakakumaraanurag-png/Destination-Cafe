"use server";

import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/server-auth";
import { Prisma } from "@prisma/client";

export interface GetAuditLogsParams {
  userId?: string;
  action?: string;
  entity?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function getAuditLogs(params: GetAuditLogsParams = {}) {
  await requirePermission("VIEW_AUDIT_LOGS");

  const { userId, action, entity, search, page = 1, pageSize = 30 } = params;

  const whereClause: Prisma.AuditLogWhereInput = {};

  if (userId && userId !== "ALL") {
    whereClause.userId = userId;
  }

  if (action && action !== "ALL") {
    whereClause.action = action;
  }

  if (entity && entity !== "ALL") {
    whereClause.entity = entity;
  }

  if (search && search.trim() !== "") {
    const q = search.trim();
    whereClause.OR = [
      { action: { contains: q, mode: "insensitive" } },
      { entity: { contains: q, mode: "insensitive" } },
      { entityId: { contains: q, mode: "insensitive" } },
      { details: { contains: q, mode: "insensitive" } },
      { user: { name: { contains: q, mode: "insensitive" } } },
      { user: { email: { contains: q, mode: "insensitive" } } },
    ];
  }

  const [totalCount, logs] = await Promise.all([
    prisma.auditLog.count({ where: whereClause }),
    prisma.auditLog.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            userRole: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  // Extract distinct actions & entities for filter dropdowns
  const distinctActions = await prisma.auditLog.groupBy({
    by: ["action"],
    orderBy: { action: "asc" },
  });

  const distinctEntities = await prisma.auditLog.groupBy({
    by: ["entity"],
    orderBy: { entity: "asc" },
  });

  return {
    totalCount,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
    logs,
    distinctActions: distinctActions.map((a) => a.action),
    distinctEntities: distinctEntities.map((e) => e.entity),
  };
}
