"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requirePermission, requireCoach, getOptionalSession } from "@/lib/dal";
import { getTodayString } from "@/lib/date";
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
  hasAccount: boolean;
  accountEmail: string | null;
};

const ACCENTS: CoachAccent[] = ["navy", "orange", "green", "slate"];

function toAccent(value: string): CoachAccent {
  return ACCENTS.includes(value as CoachAccent) ? (value as CoachAccent) : "navy";
}

/** Public roster listing — used on both the marketing homepage and in-app pages, no auth required. */
export async function listCoaches(): Promise<CoachRecord[]> {
  try {
    const coaches = await prisma.coach.findMany({
      orderBy: { createdAt: "asc" },
      include: { user: { select: { email: true } } },
    });
    return coaches.map((c) => ({
      id: c.id,
      name: c.name,
      role: c.role,
      focus: c.focus,
      bio: c.bio,
      accent: toAccent(c.accent),
      bookable: c.bookable,
      hasAccount: Boolean(c.user),
      accountEmail: c.user?.email ?? null,
    }));
  } catch (error) {
    console.error("Database query failed in listCoaches:", error);
    return [];
  }
}

/** Users with no coach profile yet — for the "link an existing account" picker. Instructors, staff, students, anyone. */
export async function listUsersAvailableForCoachLinking(): Promise<
  { id: string; name: string; email: string }[]
> {
  await requirePermission("coaches:edit");
  const users = await prisma.user.findMany({
    where: { coachProfile: null },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
  return users;
}

type CoachActionResult =
  | { success: true; generatedPassword?: string }
  | { success: false; error: string };

export type CoachInput = {
  name: string;
  role: string;
  focus: string;
  bio: string;
  accent: CoachAccent;
  bookable: boolean;
  /** "none" leaves any existing account link untouched; "link" attaches an existing user; "new" creates a fresh account. */
  accountMode: "none" | "link" | "new";
  linkUserId?: string;
  newAccountEmail?: string;
};

function validate(input: CoachInput): string | null {
  if (!input.name.trim() || input.name.trim().length < 2) return "Name must be at least 2 characters long.";
  if (!input.role.trim()) return "Role is required.";
  if (!input.focus.trim()) return "Focus is required.";
  if (!input.bio.trim()) return "Bio is required.";
  if (input.accountMode === "link" && !input.linkUserId) return "Choose a user to link.";
  if (input.accountMode === "new" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.newAccountEmail || "")) {
    return "Enter a valid email for the new account.";
  }
  return null;
}

/** Resolves accountMode into a userId to attach to the Coach row, creating a new User if needed. Returns the generated password only when a new account was created. */
async function resolveAccountLink(
  input: CoachInput,
): Promise<{ success: true; userId?: string; generatedPassword?: string } | { success: false; error: string }> {
  if (input.accountMode === "none") return { success: true };

  if (input.accountMode === "link") {
    const user = await prisma.user.findUnique({ where: { id: input.linkUserId! } });
    if (!user) return { success: false, error: "That user no longer exists." };
    const existingProfile = await prisma.coach.findUnique({ where: { userId: user.id } });
    if (existingProfile) return { success: false, error: "That user is already linked to a coach profile." };
    return { success: true, userId: user.id };
  }

  // accountMode === "new"
  const email = input.newAccountEmail!.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { success: false, error: "An account with this email already exists." };

  const generatedPassword = crypto.randomBytes(9).toString("base64url");
  const passwordHash = await bcrypt.hash(generatedPassword, 10);
  const created = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name: input.name.trim(), email, passwordHash, category: "STUDENT", role: "STUDENT" },
    });
    await tx.gamification.create({
      data: { userId: user.id, xp: 0, streak: 0, lastActive: getTodayString() },
    });
    return user;
  });
  return { success: true, userId: created.id, generatedPassword };
}

export async function createCoachAction(input: CoachInput): Promise<CoachActionResult> {
  await requirePermission("coaches:create");

  const error = validate(input);
  if (error) return { success: false, error };

  const linked = await resolveAccountLink(input);
  if (!linked.success) return linked;

  await prisma.coach.create({
    data: {
      name: input.name.trim(),
      role: input.role.trim(),
      focus: input.focus.trim(),
      bio: input.bio.trim(),
      accent: input.accent,
      bookable: input.bookable,
      userId: linked.userId,
    },
  });

  revalidatePath("/admin/coaches");
  revalidatePath("/team");
  revalidatePath("/book-a-coach");
  revalidatePath("/");
  return { success: true, generatedPassword: linked.generatedPassword };
}

export async function updateCoachAction(id: string, input: CoachInput): Promise<CoachActionResult> {
  await requirePermission("coaches:edit");

  const error = validate(input);
  if (error) return { success: false, error };

  const linked = await resolveAccountLink(input);
  if (!linked.success) return linked;

  await prisma.coach.update({
    where: { id },
    data: {
      name: input.name.trim(),
      role: input.role.trim(),
      focus: input.focus.trim(),
      bio: input.bio.trim(),
      accent: input.accent,
      bookable: input.bookable,
      ...(linked.userId ? { userId: linked.userId } : {}),
    },
  });

  revalidatePath("/admin/coaches");
  revalidatePath("/team");
  revalidatePath("/book-a-coach");
  revalidatePath("/");
  return { success: true, generatedPassword: linked.generatedPassword };
}

type AdminActionResult = { success: true } | { success: false; error: string };

/** Detaches a coach's account link without deleting either record — useful if the wrong user was linked. */
export async function unlinkCoachAccountAction(coachId: string): Promise<AdminActionResult> {
  await requirePermission("coaches:edit");
  await prisma.coach.update({ where: { id: coachId }, data: { userId: null } });
  revalidatePath("/admin/coaches");
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

/** Non-redirecting check for UI purposes (e.g. showing a "Coach Portal" link) — use requireCoach() to actually gate a page. */
export async function amICoach(): Promise<boolean> {
  const session = await getOptionalSession();
  if (!session) return false;
  const coach = await prisma.coach.findUnique({ where: { userId: session.userId }, select: { id: true } });
  return Boolean(coach);
}

// ---------- Coach portal (self-service, no admin permission — gated by requireCoach()) ----------

export type MyCoachProfile = {
  id: string;
  name: string;
  role: string;
  focus: string;
  bookable: boolean;
};

export async function getMyCoachProfile(): Promise<MyCoachProfile> {
  const { coachId } = await requireCoach();
  const coach = await prisma.coach.findUniqueOrThrow({ where: { id: coachId } });
  return { id: coach.id, name: coach.name, role: coach.role, focus: coach.focus, bookable: coach.bookable };
}

export type MyCoachBooking = {
  id: string;
  sessionAt: Date;
  createdAt: Date;
  studentName: string;
  studentEmail: string;
};

export async function getMyCoachBookings(): Promise<MyCoachBooking[]> {
  const { coachId } = await requireCoach();
  const bookings = await prisma.coachBooking.findMany({
    where: { coachId },
    orderBy: { sessionAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });
  return bookings.map((b) => ({
    id: b.id,
    sessionAt: b.sessionAt,
    createdAt: b.createdAt,
    studentName: b.user.name,
    studentEmail: b.user.email,
  }));
}

export type AvailabilitySlot = { weekday: number; time: string };

export async function getMyCoachAvailability(): Promise<AvailabilitySlot[]> {
  const { coachId } = await requireCoach();
  const slots = await prisma.coachAvailability.findMany({
    where: { coachId },
    orderBy: [{ weekday: "asc" }, { time: "asc" }],
  });
  return slots.map((s) => ({ weekday: s.weekday, time: s.time }));
}

/** Replaces this coach's entire weekly availability with the given set of slots. */
export async function setMyCoachAvailability(slots: AvailabilitySlot[]): Promise<AdminActionResult> {
  const { coachId } = await requireCoach();

  for (const s of slots) {
    if (s.weekday < 0 || s.weekday > 6) return { success: false, error: "Invalid weekday." };
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(s.time)) return { success: false, error: "Invalid time format." };
  }

  const deduped = Array.from(new Map(slots.map((s) => [`${s.weekday}-${s.time}`, s])).values());

  await prisma.$transaction([
    prisma.coachAvailability.deleteMany({ where: { coachId } }),
    ...(deduped.length > 0
      ? [
          prisma.coachAvailability.createMany({
            data: deduped.map((s) => ({ coachId, weekday: s.weekday, time: s.time })),
          }),
        ]
      : []),
  ]);

  revalidatePath("/coach/availability");
  return { success: true };
}
