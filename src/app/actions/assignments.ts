"use server";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { requirePermission, verifySession, getOptionalSession } from "@/lib/dal";
import { notify } from "@/lib/notify";
import { revalidatePath } from "next/cache";

type ActionResult = { success: true } | { success: false; error: string };
export type SubmissionType = "FILE" | "GITHUB" | "PORTFOLIO" | "DRIVE" | "VIDEO";
export type SubmissionStatus = "SUBMITTED" | "UNDER_REVIEW" | "GRADED" | "RESUBMISSION_REQUESTED";

async function assertCohortAccess(cohortId: string) {
  const admin = await requirePermission("courses:view");
  const cohort = await prisma.cohort.findUnique({
    where: { id: cohortId },
    include: { course: { select: { instructorUserId: true } } },
  });
  if (!cohort) return { admin, cohort: null };
  if (admin.category === "INSTRUCTOR" && cohort.course.instructorUserId !== admin.id) {
    throw new Error("You can only manage assignments for cohorts assigned to you.");
  }
  return { admin, cohort };
}

async function assertAssignmentAccess(assignmentId: string) {
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: { cohort: { include: { course: { select: { instructorUserId: true } } } } },
  });
  if (!assignment) return { admin: await requirePermission("courses:view"), assignment: null };
  const { admin } = await assertCohortAccess(assignment.cohortId);
  return { admin, assignment };
}

// ---------- Admin/instructor-facing ----------

export type AssignmentRow = {
  id: string;
  cohortId: string;
  title: string;
  description: string;
  dueDate: Date | null;
  maxScore: number;
  submittedCount: number;
  gradedCount: number;
  enrolledCount: number;
};

export async function listAssignments(cohortId: string): Promise<AssignmentRow[]> {
  const { cohort } = await assertCohortAccess(cohortId);
  if (!cohort) return [];

  const [assignments, enrolledCount] = await Promise.all([
    prisma.assignment.findMany({
      where: { cohortId },
      include: { _count: { select: { submissions: true } } },
      orderBy: { dueDate: "asc" },
    }),
    prisma.enrollment.count({ where: { cohortId } }),
  ]);

  const gradedCounts = await Promise.all(
    assignments.map((a) => prisma.assignmentSubmission.count({ where: { assignmentId: a.id, status: "GRADED" } })),
  );

  return assignments.map((a, i) => ({
    id: a.id,
    cohortId: a.cohortId,
    title: a.title,
    description: a.description,
    dueDate: a.dueDate,
    maxScore: a.maxScore,
    submittedCount: a._count.submissions,
    gradedCount: gradedCounts[i],
    enrolledCount,
  }));
}

export type AssignmentInput = {
  title: string;
  description: string;
  dueDate?: string;
  maxScore: number;
};

export async function createAssignmentAction(cohortId: string, input: AssignmentInput): Promise<ActionResult> {
  const { admin, cohort } = await assertCohortAccess(cohortId);
  if (!cohort) return { success: false, error: "Cohort not found." };
  if (!input.title.trim()) return { success: false, error: "Title is required." };

  await prisma.assignment.create({
    data: {
      cohortId,
      title: input.title.trim(),
      description: input.description.trim(),
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      maxScore: input.maxScore || 100,
      createdById: admin.id,
    },
  });
  revalidatePath(`/admin/courses/${cohort.courseSlug}/cohorts/${cohortId}/assignments`);
  return { success: true };
}

export async function updateAssignmentAction(id: string, input: AssignmentInput): Promise<ActionResult> {
  const { assignment } = await assertAssignmentAccess(id);
  if (!assignment) return { success: false, error: "Assignment not found." };
  if (!input.title.trim()) return { success: false, error: "Title is required." };

  await prisma.assignment.update({
    where: { id },
    data: {
      title: input.title.trim(),
      description: input.description.trim(),
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      maxScore: input.maxScore || 100,
    },
  });
  revalidatePath(`/admin/courses/${assignment.cohort.courseSlug}/cohorts/${assignment.cohortId}/assignments`);
  return { success: true };
}

export async function deleteAssignmentAction(id: string): Promise<ActionResult> {
  const { assignment } = await assertAssignmentAccess(id);
  if (!assignment) return { success: false, error: "Assignment not found." };

  await prisma.assignment.delete({ where: { id } });
  revalidatePath(`/admin/courses/${assignment.cohort.courseSlug}/cohorts/${assignment.cohortId}/assignments`);
  return { success: true };
}

export type SubmissionRow = {
  userId: string;
  userName: string;
  userEmail: string;
  submission: {
    id: string;
    type: SubmissionType;
    url: string;
    note: string | null;
    status: SubmissionStatus;
    grade: number | null;
    feedback: string | null;
    submittedAt: Date;
  } | null;
};

export async function listSubmissions(assignmentId: string): Promise<{
  assignment: { id: string; title: string; maxScore: number } | null;
  rows: SubmissionRow[];
}> {
  const { assignment } = await assertAssignmentAccess(assignmentId);
  if (!assignment) return { assignment: null, rows: [] };

  const [enrollments, submissions] = await Promise.all([
    prisma.enrollment.findMany({
      where: { cohortId: assignment.cohortId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { user: { name: "asc" } },
    }),
    prisma.assignmentSubmission.findMany({ where: { assignmentId } }),
  ]);

  const byUser = new Map(submissions.map((s) => [s.userId, s]));
  const rows = enrollments.map((e) => {
    const s = byUser.get(e.user.id);
    return {
      userId: e.user.id,
      userName: e.user.name,
      userEmail: e.user.email,
      submission: s
        ? {
            id: s.id,
            type: s.type,
            url: s.url,
            note: s.note,
            status: s.status,
            grade: s.grade,
            feedback: s.feedback,
            submittedAt: s.submittedAt,
          }
        : null,
    };
  });

  return {
    assignment: { id: assignment.id, title: assignment.title, maxScore: assignment.maxScore },
    rows,
  };
}

export async function gradeSubmissionAction(
  submissionId: string,
  input: { grade: number; feedback?: string },
): Promise<ActionResult> {
  const admin = await requirePermission("courses:view");
  const submission = await prisma.assignmentSubmission.findUnique({
    where: { id: submissionId },
    include: { assignment: { include: { cohort: { include: { course: true } } } } },
  });
  if (!submission) return { success: false, error: "Submission not found." };
  if (admin.category === "INSTRUCTOR" && submission.assignment.cohort.course.instructorUserId !== admin.id) {
    return { success: false, error: "You can only grade submissions for courses assigned to you." };
  }

  await prisma.assignmentSubmission.update({
    where: { id: submissionId },
    data: {
      status: "GRADED",
      grade: input.grade,
      feedback: input.feedback || null,
      gradedById: admin.id,
      gradedAt: new Date(),
    },
  });

  await notify(
    submission.userId,
    "application",
    `Your submission for "${submission.assignment.title}" was graded: ${input.grade}/${submission.assignment.maxScore}`,
    `/courses/${submission.assignment.cohort.courseSlug}?learn=true`,
  );

  revalidatePath(
    `/admin/courses/${submission.assignment.cohort.courseSlug}/cohorts/${submission.assignment.cohortId}/assignments/${submission.assignmentId}`,
  );
  return { success: true };
}

export async function requestResubmissionAction(submissionId: string, feedback: string): Promise<ActionResult> {
  const admin = await requirePermission("courses:view");
  const submission = await prisma.assignmentSubmission.findUnique({
    where: { id: submissionId },
    include: { assignment: { include: { cohort: { include: { course: true } } } } },
  });
  if (!submission) return { success: false, error: "Submission not found." };
  if (admin.category === "INSTRUCTOR" && submission.assignment.cohort.course.instructorUserId !== admin.id) {
    return { success: false, error: "You can only review submissions for courses assigned to you." };
  }

  await prisma.assignmentSubmission.update({
    where: { id: submissionId },
    data: { status: "RESUBMISSION_REQUESTED", feedback: feedback || null, gradedById: admin.id, gradedAt: new Date() },
  });

  await notify(
    submission.userId,
    "application",
    `Resubmission requested for "${submission.assignment.title}"`,
    `/courses/${submission.assignment.cohort.courseSlug}?learn=true`,
  );

  revalidatePath(
    `/admin/courses/${submission.assignment.cohort.courseSlug}/cohorts/${submission.assignment.cohortId}/assignments/${submission.assignmentId}`,
  );
  return { success: true };
}

// ---------- Student-facing ----------

export type MyAssignmentRow = {
  id: string;
  title: string;
  description: string;
  dueDate: Date | null;
  maxScore: number;
  submission: {
    type: SubmissionType;
    url: string;
    note: string | null;
    status: SubmissionStatus;
    grade: number | null;
    feedback: string | null;
    submittedAt: Date;
  } | null;
};

export async function getMyAssignments(courseSlug: string): Promise<MyAssignmentRow[]> {
  const session = await getOptionalSession();
  if (!session) return [];

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseSlug: { userId: session.userId, courseSlug } },
  });
  if (!enrollment?.cohortId) return [];

  const assignments = await prisma.assignment.findMany({
    where: { cohortId: enrollment.cohortId },
    orderBy: { dueDate: "asc" },
  });
  const submissions = await prisma.assignmentSubmission.findMany({
    where: { assignmentId: { in: assignments.map((a) => a.id) }, userId: session.userId },
  });

  const byAssignment = new Map(submissions.map((s) => [s.assignmentId, s]));
  return assignments.map((a) => {
    const s = byAssignment.get(a.id);
    return {
      id: a.id,
      title: a.title,
      description: a.description,
      dueDate: a.dueDate,
      maxScore: a.maxScore,
      submission: s
        ? {
            type: s.type,
            url: s.url,
            note: s.note,
            status: s.status,
            grade: s.grade,
            feedback: s.feedback,
            submittedAt: s.submittedAt,
          }
        : null,
    };
  });
}

export async function submitAssignmentAction(
  assignmentId: string,
  input: { type: SubmissionType; url: string; note?: string },
): Promise<ActionResult> {
  const session = await verifySession();
  if (!input.url.trim()) return { success: false, error: "Provide a link or upload a file." };

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: { cohort: true },
  });
  if (!assignment) return { success: false, error: "Assignment not found." };

  const enrollment = await prisma.enrollment.findFirst({
    where: { userId: session.userId, cohortId: assignment.cohortId },
  });
  if (!enrollment) return { success: false, error: "You're not enrolled in this cohort." };

  await prisma.assignmentSubmission.upsert({
    where: { assignmentId_userId: { assignmentId, userId: session.userId } },
    update: { type: input.type, url: input.url.trim(), note: input.note || null, status: "SUBMITTED", grade: null, feedback: null, submittedAt: new Date() },
    create: { assignmentId, userId: session.userId, type: input.type, url: input.url.trim(), note: input.note || null },
  });

  revalidatePath(`/courses/${assignment.cohort.courseSlug}`);
  return { success: true };
}

const ALLOWED_FILE_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "application/zip": "zip",
  "application/x-zip-compressed": "zip",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "image/png": "png",
  "image/jpeg": "jpg",
};
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "assignments");

export async function uploadAssignmentFileAction(
  formData: FormData,
): Promise<ActionResult & { path?: string }> {
  await verifySession();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Choose a file to upload." };
  }
  if (file.size > MAX_FILE_BYTES) {
    return { success: false, error: "File must be 10MB or smaller." };
  }
  const ext = ALLOWED_FILE_TYPES[file.type];
  if (!ext) {
    return { success: false, error: "Only PDF, DOC/DOCX, ZIP, PNG, or JPEG files are allowed." };
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), bytes);

  return { success: true, path: `/uploads/assignments/${filename}` };
}
