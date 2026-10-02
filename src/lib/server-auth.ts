import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { hasPermission, Permission } from "@/lib/permissions";
import { UserRole } from "@prisma/client";

export async function requireAuth() {
  const session = await getServerAuthSession();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

export async function requirePermission(permission: Permission) {
  const session = await requireAuth();
  const allowed = hasPermission(session.user.role, permission);
  if (!allowed) {
    redirect("/unauthorized");
  }
  return session;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.user.role)) {
    redirect("/unauthorized");
  }
  return session;
}
