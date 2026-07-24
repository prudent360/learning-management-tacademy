"use server";

import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission, verifySession, getOptionalSession } from "@/lib/dal";
import { notify } from "@/lib/notify";
import { ensureEnrollment } from "@/app/actions/enrollment";
import { revalidatePath } from "next/cache";

type ActionResult = { success: true } | { success: false; error: string };
type ApplicationStatus = "SUBMITTED" | "UNDER_REVIEW" | "ADMITTED" | "REJECTED" | "WAITLISTED";

// ---------- Student-facing ----------

const ApplySchema = z.object({
  motivation: z.string().trim().max(2000).optional(),
  experience: z.string().trim().max(2000).optional(),
});

export type ApplyInput = z.infer<typeof ApplySchema>;

export type MyApplication = {
  status: ApplicationStatus;
  cohortName: string | null;
  createdAt: Date;
};

/** For the public program page — null means the student hasn't applied (or isn't logged in). */
export async function getMyApplication(courseSlug: string): Promise<MyApplication | null> {
  const session = await getOptionalSession();
  if (!session) return null;

  const application = await prisma.application.findUnique({
    where: { userId_courseSlug: { userId: session.userId, courseSlug } },
    include: { cohort: { select: { name: true } } },
  });
  if (!application) return null;

  return {
    status: application.status,
    cohortName: application.cohort?.name ?? null,
    createdAt: application.createdAt,
  };
}

export async function submitApplicationAction(
  courseSlug: string,
  input: ApplyInput,
): Promise<ActionResult> {
  const session = await verifySession();
  if (!session) return { success: false, error: "Please log in to apply." };

  const parsed = ApplySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const course = await prisma.course.findUnique({ where: { slug: courseSlug } });
  if (!course) return { success: false, error: "Program not found." };

  const existing = await prisma.application.findUnique({
    where: { userId_courseSlug: { userId: session.userId, courseSlug } },
  });
  if (existing) return { success: false, error: "You've already applied to this program." };

  // Apply into whichever cohort is currently taking applications.
  const openCohort = await prisma.cohort.findFirst({
    where: { courseSlug, status: "ENROLLMENT_OPEN" },
    orderBy: { startDate: "asc" },
  });
  if (!openCohort) {
    return { success: false, error: "This program isn't accepting applications right now." };
  }

  await prisma.application.create({
    data: {
      userId: session.userId,
      courseSlug,
      cohortId: openCohort.id,
      motivation: parsed.data.motivation || null,
      experience: parsed.data.experience || null,
    },
  });

  await notify(
    session.userId,
    "application",
    `Your application to ${course.title} has been received.`,
    `/courses/${courseSlug}`,
  );

  revalidatePath(`/courses/${courseSlug}`);
  return { success: true };
}

// ---------- Admin-facing ----------

export type ApplicationRow = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  courseSlug: string;
  courseTitle: string;
  cohortName: string | null;
  status: ApplicationStatus;
  motivation: string | null;
  experience: string | null;
  createdAt: Date;
};

export type ListApplicationsFilters = {
  q?: string;
  status?: ApplicationStatus;
  sort?: "newest" | "oldest";
};

export async function listApplications(filters: ListApplicationsFilters = {}): Promise<ApplicationRow[]> {
  const admin = await requirePermission("applications:view");
  const { q, status, sort = "newest" } = filters;

  const scopeToInstructor = admin.category === "INSTRUCTOR" ? admin.id : undefined;

  const applications = await prisma.application.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(scopeToInstructor ? { course: { instructorUserId: scopeToInstructor } } : {}),
      ...(q
        ? {
            OR: [
              { user: { name: { contains: q, mode: "insensitive" } } },
              { user: { email: { contains: q, mode: "insensitive" } } },
              { course: { title: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: {
      user: { select: { name: true, email: true } },
      course: { select: { title: true } },
      cohort: { select: { name: true } },
    },
    orderBy: { createdAt: sort === "oldest" ? "asc" : "desc" },
  });

  return applications.map((a) => ({
    id: a.id,
    userId: a.userId,
    userName: a.user.name,
    userEmail: a.user.email,
    courseSlug: a.courseSlug,
    courseTitle: a.course.title,
    cohortName: a.cohort?.name ?? null,
    status: a.status,
    motivation: a.motivation,
    experience: a.experience,
    createdAt: a.createdAt,
  }));
}

export async function getApplicationStats(): Promise<Record<ApplicationStatus, number>> {
  const admin = await requirePermission("applications:view");
  const scopeToInstructor = admin.category === "INSTRUCTOR" ? admin.id : undefined;

  const rows = await prisma.application.groupBy({
    by: ["status"],
    _count: { status: true },
    where: scopeToInstructor ? { course: { instructorUserId: scopeToInstructor } } : {},
  });

  const stats: Record<ApplicationStatus, number> = {
    SUBMITTED: 0,
    UNDER_REVIEW: 0,
    ADMITTED: 0,
    REJECTED: 0,
    WAITLISTED: 0,
  };
  for (const row of rows) stats[row.status] = row._count.status;
  return stats;
}

async function assertApplicationAccess(id: string) {
  const admin = await requirePermission("applications:edit");
  const application = await prisma.application.findUnique({
    where: { id },
    include: { course: { select: { instructorUserId: true } } },
  });
  if (!application) return { admin, application: null };
  if (admin.category === "INSTRUCTOR" && application.course.instructorUserId !== admin.id) {
    throw new Error("You can only review applications for courses assigned to you.");
  }
  return { admin, application };
}

import { sendDirectEmail } from "@/lib/email";

export async function admitApplicationAction(id: string): Promise<ActionResult> {
  const { admin, application } = await assertApplicationAccess(id);
  if (!application) return { success: false, error: "Application not found." };

  const course = await prisma.course.findUnique({ where: { slug: application.courseSlug } });
  if (!course) return { success: false, error: "Program not found." };

  await prisma.application.update({
    where: { id },
    data: { status: "ADMITTED", reviewedById: admin.id, reviewedAt: new Date() },
  });

  const applicant = await prisma.user.findUnique({
    where: { id: application.userId },
    select: { email: true, name: true },
  });

  if (course.price <= 0) {
    // Free program: admission itself grants the seat, no checkout needed.
    await ensureEnrollment(application.userId, application.courseSlug);
    await notify(
      application.userId,
      "application",
      `You're admitted to ${course.title}! Your seat is confirmed.`,
      `/courses/${application.courseSlug}?learn=true`,
    );
  } else {
    await notify(
      application.userId,
      "application",
      `You're admitted to ${course.title}! Complete payment to secure your seat.`,
      `/courses/${application.courseSlug}?checkout=true`,
    );
  }

  if (applicant?.email) {
    const isFree = course.price <= 0;
    await sendDirectEmail({
      to: applicant.email,
      subject: `Congratulations! You've been admitted to ${course.title}`,
      html: `<div style="font-family: sans-serif; padding: 20px; line-height: 1.5;">
        <h2 style="color: #1e3a8a;">Congratulations, ${applicant.name}!</h2>
        <p>We are pleased to inform you that your application for <strong>${course.title}</strong> has been <span style="color:#16a34a; font-weight:bold;">ADMITTED</span>.</p>
        ${isFree ? '<p>Your seat is confirmed! Log in to your student dashboard to start learning.</p>' : '<p>Please log in to your student dashboard to complete payment and secure your seat.</p>'}
        <p style="margin-top: 20px;"><a href="/courses/${application.courseSlug}" style="background-color:#1e3a8a; color:#fff; padding:10px 18px; text-decoration:none; border-radius:6px; font-weight:bold; display:inline-block;">View Program Dashboard</a></p>
      </div>`,
    });
  }

  revalidatePath("/admin/applications");
  revalidatePath(`/courses/${application.courseSlug}`);
  return { success: true };
}

export async function rejectApplicationAction(id: string, note?: string): Promise<ActionResult> {
  const { admin, application } = await assertApplicationAccess(id);
  if (!application) return { success: false, error: "Application not found." };

  const course = await prisma.course.findUnique({ where: { slug: application.courseSlug } });

  await prisma.application.update({
    where: { id },
    data: {
      status: "REJECTED",
      reviewedById: admin.id,
      reviewedAt: new Date(),
      reviewNote: note || null,
    },
  });

  const applicant = await prisma.user.findUnique({
    where: { id: application.userId },
    select: { email: true, name: true },
  });

  await notify(
    application.userId,
    "application",
    `Your application to ${course?.title ?? "the program"} was not successful this time.`,
    `/courses/${application.courseSlug}`,
  );

  if (applicant?.email) {
    await sendDirectEmail({
      to: applicant.email,
      subject: `Update regarding your application for ${course?.title || 'the program'}`,
      html: `<div style="font-family: sans-serif; padding: 20px; line-height: 1.5;">
        <h2>Hello ${applicant.name},</h2>
        <p>Thank you for applying for <strong>${course?.title || 'the program'}</strong>.</p>
        <p>After careful review, we regret to inform you that we are unable to accept your application for this cohort.</p>
        ${note ? `<p style="background:#f3f4f6; padding:12px; border-radius:6px;"><strong>Note from Admissions Team:</strong> ${note}</p>` : ''}
        <p>We encourage you to apply again for future cohorts!</p>
      </div>`,
    });
  }

  revalidatePath("/admin/applications");
  revalidatePath(`/courses/${application.courseSlug}`);
  return { success: true };
}
