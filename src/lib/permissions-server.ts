import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  ADMIN_ROLE_DEFS,
  DEFAULT_ROLE_PERMISSIONS,
  categoryToRoleKey,
  allPermissionKeys,
} from "@/lib/permissions";

let seeded = false;

/**
 * Idempotent: creates any of the 5 admin roles that don't exist yet, with
 * their default permissions. Never touches an existing role's permissions
 * (an admin may have customized them). Uses upsert + a defensive catch since
 * this can be called concurrently by both the layout and the page on the
 * same request — a plain findUnique-then-create would race.
 */
export async function ensureDefaultRoles(): Promise<void> {
  if (seeded) return;

  for (const def of ADMIN_ROLE_DEFS) {
    try {
      await prisma.adminRole.upsert({
        where: { key: def.key },
        update: {},
        create: {
          key: def.key,
          name: def.name,
          description: def.description,
          isSystem: def.isSystem,
          permissions: {
            create: DEFAULT_ROLE_PERMISSIONS[def.key].map((key) => ({ key })),
          },
        },
      });
    } catch (err) {
      // A concurrent request already created it — safe to ignore.
      if (!(err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002")) {
        throw err;
      }
    }
  }

  seeded = true;
}

export async function getUserPermissionKeys(userId: string): Promise<Set<string>> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { category: true } });
  if (!user) return new Set();

  const roleKey = categoryToRoleKey(user.category);
  if (!roleKey) return new Set();

  await ensureDefaultRoles();
  const role = await prisma.adminRole.findUnique({
    where: { key: roleKey },
    include: { permissions: true },
  });
  if (!role) return new Set();
  if (role.isSystem) return new Set(allPermissionKeys());

  return new Set(role.permissions.map((p) => p.key));
}

export async function hasPermission(userId: string, key: string): Promise<boolean> {
  const keys = await getUserPermissionKeys(userId);
  return keys.has(key);
}
