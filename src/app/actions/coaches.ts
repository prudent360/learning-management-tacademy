"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/dal";
import { revalidatePath } from "next/cache";

export type CoachAccent = "navy" | "orange" | "green" | "slate";

export type CoachRecord = {
  id: string;
  name: string;
  role: string;
  focus: string;
  bio: string;
  accent: CoachAccent;
  bookable: boolean;
};

const ACCENTS: CoachAccent[] = ["navy", "orange", "green", "slate"];

function toAccent(value: string): CoachAccent {
  return ACCENTS.includes(value as CoachAccent) ? (value as CoachAccent) : "navy";
}

/** Public roster listing — used on both the marketing homepage and in-app pages, no auth required. */
export async function listCoaches(): Promise<CoachRecord[]> {
  const coaches = await prisma.coach.findMany({ orderBy: { createdAt: "asc" } });
  return coaches.map((c) => ({
    id: c.id,
    name: c.name,
    role: c.role,
    focus: c.focus,
    bio: c.bio,
    accent: toAccent(c.accent),
    bookable: c.bookable,
  }));
}

type AdminActionResult = { success: true } | { success: false; error: string };

export type CoachInput = {
  name: string;
  role: string;
  focus: string;
  bio: string;
  accent: CoachAccent;
  bookable: boolean;
};

function validate(input: CoachInput): string | null {
  if (!input.name.trim() || input.name.trim().length < 2) return "Name must be at least 2 characters long.";
  if (!input.role.trim()) return "Role is required.";
  if (!input.focus.trim()) return "Focus is required.";
  if (!input.bio.trim()) return "Bio is required.";
  return null;
}

export async function createCoachAction(input: CoachInput): Promise<AdminActionResult> {
  await requirePermission("coaches:create");

  const error = validate(input);
  if (error) return { success: false, error };

  await prisma.coach.create({
    data: {
      name: input.name.trim(),
      role: input.role.trim(),
      focus: input.focus.trim(),
      bio: input.bio.trim(),
      accent: input.accent,
      bookable: input.bookable,
    },
  });

  revalidatePath("/admin/coaches");
  revalidatePath("/team");
  revalidatePath("/book-a-coach");
  revalidatePath("/");
  return { success: true };
}

export async function updateCoachAction(id: string, input: CoachInput): Promise<AdminActionResult> {
  await requirePermission("coaches:edit");

  const error = validate(input);
  if (error) return { success: false, error };

  await prisma.coach.update({
    where: { id },
    data: {
      name: input.name.trim(),
      role: input.role.trim(),
      focus: input.focus.trim(),
      bio: input.bio.trim(),
      accent: input.accent,
      bookable: input.bookable,
    },
  });

  revalidatePath("/admin/coaches");
  revalidatePath("/team");
  revalidatePath("/book-a-coach");
  revalidatePath("/");
  return { success: true };
}

export async function deleteCoachAction(id: string): Promise<AdminActionResult> {
  await requirePermission("coaches:delete");

  await prisma.coach.delete({ where: { id } });

  revalidatePath("/admin/coaches");
  revalidatePath("/team");
  revalidatePath("/book-a-coach");
  revalidatePath("/");
  return { success: true };
}
