import { UserRole } from "@prisma/client";

export type Permission =
  | "VIEW_LEADS"
  | "CREATE_LEADS"
  | "EDIT_LEADS"
  | "ARCHIVE_LEADS"
  | "MANAGE_SCORING"
  | "IMPORT_DATA"
  | "VIEW_ANALYTICS"
  | "MANAGE_TASKS"
  | "MANAGE_OPPORTUNITIES"
  | "MANAGE_PROJECTS"
  | "MANAGE_USERS"
  | "VIEW_AUDIT_LOGS";

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    "VIEW_LEADS",
    "CREATE_LEADS",
    "EDIT_LEADS",
    "ARCHIVE_LEADS",
    "MANAGE_SCORING",
    "IMPORT_DATA",
    "VIEW_ANALYTICS",
    "MANAGE_TASKS",
    "MANAGE_OPPORTUNITIES",
    "MANAGE_PROJECTS",
    "MANAGE_USERS",
    "VIEW_AUDIT_LOGS",
  ],
  MANAGER: [
    "VIEW_LEADS",
    "CREATE_LEADS",
    "EDIT_LEADS",
    "ARCHIVE_LEADS",
    "MANAGE_SCORING",
    "IMPORT_DATA",
    "VIEW_ANALYTICS",
    "MANAGE_TASKS",
    "MANAGE_OPPORTUNITIES",
    "MANAGE_PROJECTS",
    "VIEW_AUDIT_LOGS",
  ],
  SALES: [
    "VIEW_LEADS",
    "CREATE_LEADS",
    "EDIT_LEADS",
    "MANAGE_SCORING",
    "MANAGE_TASKS",
    "MANAGE_OPPORTUNITIES",
  ],
  ANALYST: [
    "VIEW_LEADS",
    "MANAGE_SCORING",
    "IMPORT_DATA",
    "VIEW_ANALYTICS",
  ],
  VIEWER: [
    "VIEW_LEADS",
    "VIEW_ANALYTICS",
  ],
};

export function hasPermission(role: UserRole | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

export function getRolePermissions(role: UserRole | undefined | null): Permission[] {
  if (!role) return [];
  return ROLE_PERMISSIONS[role] || [];
}
