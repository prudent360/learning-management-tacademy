"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin, requirePermission } from "@/lib/dal";
import { ensureDefaultRoles, getUserPermissionKeys } from "@/lib/permissions-server";
import { roleKeyToCategory, type AdminRoleKey } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

export type AdminRoleRow = {
  id: string;
  key: string;
  name: string;
  description: string;
  isSystem: boolean;
  userCount: number;
  permissionKeys: string[];
};

export async function listAdminRoles(): Promise<AdminRoleRow[]> {
  await requirePermission("roles:view");
  await ensureDefaultRoles();

  const roles = await prisma.adminRole.findMany({
    include: { permissions: true },
    orderBy: { createdAt: "asc" },
  });

  const counts = await prisma.user.groupBy({
    by: ["category"],
    _count: { category: true },
  });
  const countByCategory = new Map(counts.map((c) => [c.category, c._count.category]));

  return roles.map((r) => ({
    id: r.id,
    key: r.key,
    name: r.name,
    description: r.description,
    isSystem: r.isSystem,
    userCount: countByCategory.get(roleKeyToCategory(r.key as AdminRoleKey)) ?? 0,
    permissionKeys: r.permissions.map((p) => p.key),
  }));
}

type ActionResult = { success: true } | { success: false; error: string };

export async function updateRolePermissions(
  roleId: string,
  permissionKeys: string[],
): Promise<ActionResult> {
  await requirePermission("roles:edit");

  const role = await prisma.adminRole.findUnique({ where: { id: roleId } });
  if (!role) return { success: false, error: "Role not found." };
  if (role.isSystem) {
    return { success: false, error: "Super Admin's permissions can't be changed." };
  }

  await prisma.$transaction([
    prisma.rolePermission.deleteMany({ where: { roleId } }),
    prisma.rolePermission.createMany({
      data: permissionKeys.map((key) => ({ roleId, key })),
    }),
  ]);

  revalidatePath("/admin/roles");
  return { success: true };
}

/** Users assigned to one admin role (by its Category mapping), for the role detail panel. */
export async function listUsersForRole(roleKey: string): Promise<{ id: string; name: string; email: string }[]> {
  await requirePermission("roles:view");
  const category = roleKeyToCategory(roleKey as AdminRoleKey);
  return prisma.user.findMany({
    where: { category },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
}

/** The current admin-tier user's own granted permission keys — used to conditionally render admin nav/UI. */
export async function getMyPermissions(): Promise<string[]> {
  const user = await requireAdmin();
  return Array.from(await getUserPermissionKeys(user.id));
}
