"use server";

import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requirePermission } from "@/lib/dal";
import { revalidatePath } from "next/cache";

type ActionResult = { success: true } | { success: false; error: string };

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const CategorySchema = z.object({
  name: z.string().trim().min(1, { error: "Name is required." }),
});

export async function listCourseCategories() {
  await requirePermission("categories:view");
  const [categories, courses] = await Promise.all([
    prisma.courseCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.course.findMany({ select: { category: true } }),
  ]);
  const courseCounts = new Map<string, number>();
  for (const c of courses) {
    courseCounts.set(c.category, (courseCounts.get(c.category) ?? 0) + 1);
  }
  return categories.map((cat) => ({ ...cat, courseCount: courseCounts.get(cat.name) ?? 0 }));
}

/** Lightweight, read-only list for the course editor's category picker — any admin-tier role that can reach that form needs this, independent of the categories:* permission. */
export async function listCourseCategoryOptions() {
  await requireAdmin();
  return prisma.courseCategory.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function createCategoryAction(input: { name: string }): Promise<ActionResult> {
  await requirePermission("categories:create");
  const parsed = CategorySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const name = parsed.data.name;
  const existing = await prisma.courseCategory.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });
  if (existing) return { success: false, error: "A category with that name already exists." };

  await prisma.courseCategory.create({ data: { name, slug: slugify(name) } });
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function renameCategoryAction(
  id: string,
  input: { name: string },
): Promise<ActionResult> {
  await requirePermission("categories:edit");
  const parsed = CategorySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const name = parsed.data.name;
  const category = await prisma.courseCategory.findUnique({ where: { id } });
  if (!category) return { success: false, error: "Category not found." };

  const existing = await prisma.courseCategory.findFirst({
    where: { name: { equals: name, mode: "insensitive" }, id: { not: id } },
  });
  if (existing) return { success: false, error: "A category with that name already exists." };

  await prisma.$transaction([
    prisma.course.updateMany({ where: { category: category.name }, data: { category: name } }),
    prisma.courseCategory.update({ where: { id }, data: { name, slug: slugify(name) } }),
  ]);
  revalidatePath("/admin/categories");
  revalidatePath("/admin/courses");
  return { success: true };
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  await requirePermission("categories:delete");
  const category = await prisma.courseCategory.findUnique({ where: { id } });
  if (!category) return { success: false, error: "Category not found." };

  const inUse = await prisma.course.count({ where: { category: category.name } });
  if (inUse > 0) {
    return {
      success: false,
      error: `Can't delete "${category.name}" — it's still used by ${inUse} course${inUse === 1 ? "" : "s"}.`,
    };
  }

  await prisma.courseCategory.delete({ where: { id } });
  revalidatePath("/admin/categories");
  return { success: true };
}
