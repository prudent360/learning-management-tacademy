"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requirePermission } from "@/lib/dal";
import { revalidatePath } from "next/cache";
import { sendTemplatedEmail } from "@/lib/email";
import { notify } from "@/lib/notify";
import { getUpcomingSlots, type UpcomingSlot } from "@/lib/scheduling";

const COACH_BOOKING_TEMPLATE_KEY = "coach-booking-confirmation";
const COACH_NEW_BOOKING_TEMPLATE_KEY = "coach-new-booking-notice";

// Ensures the confirmation templates exist so the feature works out of the
// box; admins can still edit their content afterward from Email Templates.
async function ensureBookingTemplates() {
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
  await prisma.emailTemplate.upsert({
    where: { key: COACH_NEW_BOOKING_TEMPLATE_KEY },
    update: {},
    create: {
      key: COACH_NEW_BOOKING_TEMPLATE_KEY,
      name: "New Coaching Booking (for coaches)",
      description: "Sent to a coach when a student books a session with them",
      subject: "New session booked: {{student_name}}",
      body:
        "<p>Hi {{coach_name}},</p>" +
        "<p><strong>{{student_name}}</strong> ({{student_email}}) just booked a session with you for <strong>{{slot}}</strong>.</p>" +
        "<p>— The {{site_name}} Team</p>",
    },
  });
}

export type AvailableSlot = UpcomingSlot & { available: boolean };

export async function getAvailableSlotsAction(coachId: string): Promise<AvailableSlot[]> {
  await getCurrentUser();

  const coach = await prisma.coach.findUnique({ where: { id: coachId } });
  if (!coach || !coach.bookable) return [];

  const templates = await prisma.coachAvailability.findMany({ where: { coachId } });
  const upcoming = getUpcomingSlots(templates);

  const taken = await prisma.coachBooking.findMany({
    where: {
      coachName: coach.name,
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
  coachId: string,
  sessionAtIso: string
): Promise<BookCoachSessionResult> {
  const user = await getCurrentUser();

  const coach = await prisma.coach.findUnique({ where: { id: coachId } });
  if (!coach || !coach.bookable) {
    return { success: false, error: "That coach isn't available for booking." };
  }

  const templates = await prisma.coachAvailability.findMany({ where: { coachId } });
  const upcoming = getUpcomingSlots(templates);
  const match = upcoming.find((s) => s.sessionAt === sessionAtIso);
  if (!match) {
    return { success: false, error: "That time slot isn't available anymore. Please pick another." };
  }

  try {
    await prisma.coachBooking.create({
      data: { userId: user.id, coachId, coachName: coach.name, sessionAt: new Date(sessionAtIso) },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { success: false, error: "That slot was just booked by someone else. Please pick another." };
    }
    throw err;
  }

  await ensureBookingTemplates();
  const general = await prisma.generalSettings.findUnique({ where: { id: 1 } });
  const siteName = general?.siteName || "TekSkillUp";

  const emailResult = await sendTemplatedEmail(COACH_BOOKING_TEMPLATE_KEY, user.email, {
    "{{user_name}}": user.name,
    "{{coach_name}}": coach.name,
    "{{slot}}": match.label,
    "{{site_name}}": siteName,
  });

  await notify(
    user.id,
    "coach_booking",
    `Your session with ${coach.name} is confirmed for ${match.label}`,
    "/book-a-coach",
  );

  // Let the coach know too, if they have a portal account.
  if (coach.userId) {
    const coachUser = await prisma.user.findUnique({ where: { id: coach.userId } });
    if (coachUser) {
      await sendTemplatedEmail(COACH_NEW_BOOKING_TEMPLATE_KEY, coachUser.email, {
        "{{coach_name}}": coach.name,
        "{{student_name}}": user.name,
        "{{student_email}}": user.email,
        "{{slot}}": match.label,
        "{{site_name}}": siteName,
      });
      await notify(
        coach.userId,
        "coach_booking",
        `${user.name} booked a session with you for ${match.label}`,
        "/coach",
      );
    }
  }

  revalidatePath("/admin/coach-bookings");
  revalidatePath("/coach");
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
