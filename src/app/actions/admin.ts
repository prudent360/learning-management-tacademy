"use server";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Prisma, type Category } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requirePermission } from "@/lib/dal";
import { getTodayString } from "@/lib/date";
import { revalidatePath } from "next/cache";

const CATEGORIES: Category[] = [
  "STUDENT",
  "AFFILIATE",
  "STAFF",
  "INSTRUCTOR",
  "MANAGER",
  "ADMIN",
  "SUPER_ADMIN",
];

export type ListUsersFilters = {
  q?: string;
  category?: Category;
  sort?: "newest" | "oldest" | "name";
};

export async function listUsers(filters: ListUsersFilters = {}) {
  await requirePermission("users:view");

  const { q, category, sort = "newest" } = filters;

  const where: Prisma.UserWhereInput = {
    ...(category ? { category } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q } },
            { email: { contains: q } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.UserOrderByWithRelationInput =
    sort === "oldest"
      ? { createdAt: "asc" }
      : sort === "name"
        ? { name: "asc" }
        : { createdAt: "desc" };

  return prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      category: true,
      createdAt: true,
      gamification: { select: { xp: true, streak: true } },
      _count: { select: { lessonCompletions: true, badges: true } },
    },
    orderBy,
  });
}

/** Instructor-category users, for the "Assigned Instructor" picker on the course editor. */
export async function listInstructors() {
  await requireAdmin();
  return prisma.user.findMany({
    where: { category: "INSTRUCTOR" },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
}

export async function getCompletedTodayCount(): Promise<number> {
  await requireAdmin();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return prisma.lessonCompletion.count({
    where: { completedAt: { gte: start, lte: end } },
  });
}

export async function getUserDetail(userId: string) {
  await requirePermission("users:view");
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      firstName: true,
      middleName: true,
      lastName: true,
      email: true,
      gender: true,
      country: true,
      certificateName: true,
      role: true,
      category: true,
      createdAt: true,
      gamification: true,
      badges: { select: { badgeId: true, unlockedAt: true } },
      lessonCompletions: { select: { courseSlug: true, lessonId: true } },
    },
  });
}

type AdminActionResult = { success: true } | { success: false; error: string };

export async function resetUserProgress(userId: string): Promise<AdminActionResult> {
  await requirePermission("users:edit");

  await prisma.$transaction([
    prisma.lessonCompletion.deleteMany({ where: { userId } }),
    prisma.badge.deleteMany({ where: { userId } }),
    prisma.gamification.updateMany({
      where: { userId },
      data: { xp: 0, streak: 0, lastActive: getTodayString() },
    }),
  ]);

  return { success: true };
}

export type UpdateUserInput = {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  gender?: string;
  country?: string;
  certificateName?: string;
};

export async function updateUserAction(userId: string, input: UpdateUserInput): Promise<AdminActionResult> {
  await requirePermission("users:edit");

  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const middleName = input.middleName?.trim() || "";
  const email = input.email.trim().toLowerCase();

  if (firstName.length < 2) return { success: false, error: "First name must be at least 2 characters long." };
  if (lastName.length < 2) return { success: false, error: "Last name must be at least 2 characters long." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { success: false, error: "Please enter a valid email." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.id !== userId) {
    return { success: false, error: "Another account already uses this email." };
  }

  const name = [firstName, middleName, lastName].filter(Boolean).join(" ");

  await prisma.user.update({
    where: { id: userId },
    data: {
      firstName,
      middleName: middleName || null,
      lastName,
      name,
      email,
      gender: input.gender || null,
      country: input.country?.trim() || null,
      certificateName: input.certificateName?.trim() || null,
    },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  return { success: true };
}

export async function deleteUserAction(userId: string): Promise<AdminActionResult> {
  const admin = await requirePermission("users:delete");

  if (admin.id === userId) {
    return { success: false, error: "You can't delete your own account." };
  }

  await prisma.user.delete({ where: { id: userId } });

  revalidatePath("/admin/users");
  return { success: true };
}

/** Every admin-tier category (Instructor/Staff/Manager/Admin/Super Admin) grants admin-panel access; Student/Affiliate don't. */
function roleForCategory(category: Category): "STUDENT" | "ADMIN" {
  return category === "STUDENT" || category === "AFFILIATE" ? "STUDENT" : "ADMIN";
}

function generatePassword(): string {
  return crypto.randomBytes(9).toString("base64url");
}

type CreateUserResult =
  | { success: true; generatedPassword: string }
  | { success: false; error: string };

export async function createUserAction(input: {
  name: string;
  email: string;
  category: Category;
}): Promise<CreateUserResult> {
  await requirePermission("users:create");

  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();

  if (name.length < 2) {
    return { success: false, error: "Name must be at least 2 characters long." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Please enter a valid email." };
  }
  if (!CATEGORIES.includes(input.category)) {
    return { success: false, error: "Invalid category." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: "An account with this email already exists." };
  }

  const generatedPassword = generatePassword();
  const passwordHash = await bcrypt.hash(generatedPassword, 10);

  await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        name,
        email,
        passwordHash,
        category: input.category,
        role: roleForCategory(input.category),
      },
    });
    await tx.gamification.create({
      data: { userId: created.id, xp: 0, streak: 0, lastActive: getTodayString() },
    });
  });

  revalidatePath("/admin/users");
  return { success: true, generatedPassword };
}

export async function setUserCategory(userId: string, category: Category): Promise<AdminActionResult> {
  await requirePermission("users:edit");

  if (!CATEGORIES.includes(category)) {
    return { success: false, error: "Invalid category." };
  }

  const target = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (target?.role === "ADMIN" && category !== "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      return { success: false, error: "Cannot demote the last admin." };
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { category, role: roleForCategory(category) },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  return { success: true };
}

export type BulkImportRow = { name: string; email: string; category?: string };
export type BulkImportResult = {
  created: number;
  skipped: { email: string; reason: string }[];
};

export async function bulkImportUsersAction(rows: BulkImportRow[]): Promise<BulkImportResult> {
  await requirePermission("users:create");

  const result: BulkImportResult = { created: 0, skipped: [] };

  for (const row of rows) {
    const name = row.name?.trim();
    const email = row.email?.trim().toLowerCase();

    if (!name || name.length < 2) {
      result.skipped.push({ email: email || "(blank)", reason: "Invalid name." });
      continue;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      result.skipped.push({ email: email || "(blank)", reason: "Invalid email." });
      continue;
    }

    const requestedCategory = row.category?.trim().toUpperCase();
    const category: Category = CATEGORIES.includes(requestedCategory as Category)
      ? (requestedCategory as Category)
      : "STUDENT";

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      result.skipped.push({ email, reason: "Email already exists." });
      continue;
    }

    const passwordHash = await bcrypt.hash(generatePassword(), 10);
    await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: { name, email, passwordHash, category, role: roleForCategory(category) },
      });
      await tx.gamification.create({
        data: { userId: created.id, xp: 0, streak: 0, lastActive: getTodayString() },
      });
    });
    result.created += 1;
  }

  revalidatePath("/admin/users");
  return result;
}
