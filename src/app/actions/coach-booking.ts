"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requirePermission } from "@/lib/dal";
import { revalidatePath } from "next/cache";
import { sendTemplatedEmail } from "@/lib/email";
import { notify } from "@/lib/notify";
import { getUpcomingSlots, type UpcomingSlot } from "@/lib/scheduling";

const COACH_BOOKING_TEMPLATE_KEY = "coach-booking-confirmation";

async function isBookableCoach(coachName: string): Promise<boolean> {
  const coach = await prisma.coach.findFirst({ where: { name: coachName, bookable: true } });
  return Boolean(coach);
}

// Ensures the confirmation template exists so the feature works out of the
// box; admins can still edit its content afterward from Email Templates.
async function ensureBookingTemplate() {
  await prisma.emailTemplate.upsert({
    where: { key: COACH_BOOKING_TEMPLATE_KEY },
    update: {},
    create: {
      key: COACH_BOOKING_TEMPLATE_KEY,
      name: "Coach Booking Confirmation",
      description: "Sent to a student when they book a coaching session",
      subject: "Your session with {{coach_name}} is confirmed",
      body:
        "<p>Hi {{user_name}},</p>" +
        "<p>Your coaching session with <strong>{{coach_name}}</strong> is confirmed for <strong>{{slot}}</strong>.</p>" +
        "<p>We'll see you then!</p>" +
        "<p>— The {{site_name}} Team</p>",
    },
  });
}

export type AvailableSlot = UpcomingSlot & { available: boolean };

export async function getAvailableSlotsAction(coachName: string): Promise<AvailableSlot[]> {
  await getCurrentUser();

  if (!(await isBookableCoach(coachName))) return [];

  const upcoming = getUpcomingSlots();
  const taken = await prisma.coachBooking.findMany({
    where: {
      coachName,
      sessionAt: { in: upcoming.map((s) => new Date(s.sessionAt)) },
    },
    select: { sessionAt: true },
  });
  const takenTimes = new Set(taken.map((t) => t.sessionAt.toISOString()));

  return upcoming.map((s) => ({ ...s, available: !takenTimes.has(s.sessionAt) }));
}

export type BookCoachSessionResult =
  | { success: true; emailSent: boolean; label: string }
  | { success: false; error: string };

export async function bookCoachSessionAction(
  coachName: string,
  sessionAtIso: string
): Promise<BookCoachSessionResult> {
  const user = await getCurrentUser();

  if (!(await isBookableCoach(coachName))) {
    return { success: false, error: "That coach isn't available for booking." };
  }

  const upcoming = getUpcomingSlots();
  const match = upcoming.find((s) => s.sessionAt === sessionAtIso);
  if (!match) {
    return { success: false, error: "That time slot isn't available anymore. Please pick another." };
  }

  try {
    await prisma.coachBooking.create({
      data: { userId: user.id, coachName, sessionAt: new Date(sessionAtIso) },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { success: false, error: "That slot was just booked by someone else. Please pick another." };
    }
    throw err;
  }

  await ensureBookingTemplate();
  const general = await prisma.generalSettings.findUnique({ where: { id: 1 } });

  const emailResult = await sendTemplatedEmail(COACH_BOOKING_TEMPLATE_KEY, user.email, {
    "{{user_name}}": user.name,
    "{{coach_name}}": coachName,
    "{{slot}}": match.label,
    "{{site_name}}": general?.siteName || "TekSkillUp",
  });

  await notify(
    user.id,
    "coach_booking",
    `Your session with ${coachName} is confirmed for ${match.label}`,
    "/book-a-coach",
  );

  revalidatePath("/admin/coach-bookings");
  return { success: true, emailSent: emailResult.success, label: match.label };
}

export type CoachBookingRow = {
  id: string;
  coachName: string;
  sessionAt: Date;
  createdAt: Date;
  user: { name: string; email: string };
};

export async function listCoachBookings(): Promise<CoachBookingRow[]> {
  await requirePermission("coach_bookings:view");
  return prisma.coachBooking.findMany({
    select: {
      id: true,
      coachName: true,
      sessionAt: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
    },
    orderBy: { sessionAt: "asc" },
  });
}

type AdminActionResult = { success: true } | { success: false; error: string };

export async function cancelCoachBookingAction(bookingId: string): Promise<AdminActionResult> {
  await requirePermission("coach_bookings:delete");
  await prisma.coachBooking.delete({ where: { id: bookingId } });
  revalidatePath("/admin/coach-bookings");
  return { success: true };
}
