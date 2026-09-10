import "server-only";
import prisma from "@/lib/db";
import { cache } from "react";
export * from "./rbac-data";
import { ALL_PERMISSIONS, type PermissionName } from "./rbac-data";

type RoleRow = {
  userRole: {
    name: string;
    permissions: { permission: { name: string } }[];
  } | null;
  role: string;
};

/**
 * Returns the set of permission names a user holds, derived from their
 * RBAC role (UserRole -> permissions). Falls back to the legacy role
 * column so bridged accounts keep working.
 */
export const getUserPermissions = cache(
  async (userId: string): Promise<Set<string>> => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        userRole: {
          select: {
            name: true,
            permissions: { select: { permission: { select: { name: true } } } },
          },
        },
        role: true,
      },
    });
    return roleRowToPermissions(user);
  }
);

export function roleRowToPermissions(row: RoleRow | null): Set<string> {
  if (!row) return new Set();
  const roleName = row.userRole?.name ?? row.role;
  if (roleName === "SUPER_ADMIN") return new Set(ALL_PERMISSIONS);
  if (row.userRole) return new Set(row.userRole.permissions.map((p) => p.permission.name));
  return new Set();
}

/**
 * Human readable role name for a user.
 */
export async function resolveRoleName(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { userRole: { select: { name: true } }, role: true },
  });
  if (!user) return "UNKNOWN";
  if (user.userRole) return user.userRole.name;
  return user.role;
}

/**
 * Event scope: the event ids a user is assigned to (coordinator/judge).
 * For SUPER_ADMIN/ADMIN, scope is unbounded (returns null).
 */
export async function getEventScope(userId: string): Promise<string[] | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, userRole: { select: { name: true } } },
  });
  const roleName = user?.userRole?.name ?? user?.role;
  if (roleName === "SUPER_ADMIN" || roleName === "ADMIN") return null;

  const [coords, judges] = await Promise.all([
    prisma.eventCoordinator.findMany({ where: { userId }, select: { eventId: true } }),
    prisma.judge.findMany({ where: { userId }, select: { eventId: true } }),
  ]);
  const ids = new Set([...coords, ...judges].map((x) => x.eventId));
  return [...ids];
}

/**
 * Server-side permission guard for pages/route handlers.
 * Returns null when permitted, otherwise an error message describing denial.
 */
export async function assertPermission(
  userId: string,
  permission: PermissionName
): Promise<string | null> {
  const permissions = await getUserPermissions(userId);
  if (permissions.has(permission)) return null;
  return `Missing permission: ${permission}`;
}

/**
 * Scope-aware guard: verifies a permission AND that the event is within the
 * user's event scope (or the user is system-wide).
 */
export async function assertEventScope(
  userId: string,
  permission: PermissionName,
  eventId: string
): Promise<string | null> {
  const err = await assertPermission(userId, permission);
  if (err) return err;
  const scope = await getEventScope(userId);
  if (scope === null) return null; // unbounded (system-wide)
  return scope.includes(eventId)
    ? null
    : `Access denied: event ${eventId} is outside your assigned scope`;
}