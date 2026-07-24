"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";

type ActionResult = { success: true } | { success: false; error: string };

export type ResumeEducationRow = {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string | null;
  endDate: string | null;
  current: boolean;
  description: string;
};

export type ResumeExperienceRow = {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string | null;
  endDate: string | null;
  current: boolean;
  description: string;
};

export type ResumeSkillRow = { id: string; name: string };

export type ResumeProjectRow = { id: string; title: string; url: string; description: string };

export type VerifiedCertificateRow = { id: string; courseTitle: string; dateIssued: string };

export type ResumeData = {
  headline: string;
  summary: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  contactName: string;
  contactEmail: string;
  education: ResumeEducationRow[];
  experience: ResumeExperienceRow[];
  skills: ResumeSkillRow[];
  projects: ResumeProjectRow[];
  certificates: VerifiedCertificateRow[];
};

function toDateLabel(d: Date | null): string | null {
  return d ? d.toISOString() : null;
}

/** Loads (creating an empty row on first visit) the current user's resume, plus verified certificates pulled live from the Certificate table. */
export async function getMyResume(): Promise<ResumeData> {
  const { userId } = await verifySession();

  const [resume, user, certificates] = await Promise.all([
    prisma.resume.upsert({
      where: { userId },
      create: { userId },
      update: {},
      include: {
        education: { orderBy: { sortOrder: "asc" } },
        experience: { orderBy: { sortOrder: "asc" } },
        skills: { orderBy: { sortOrder: "asc" } },
        projects: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { name: true, email: true } }),
    prisma.certificate.findMany({ where: { userId }, orderBy: { dateIssued: "desc" } }),
  ]);

  return {
    headline: resume.headline,
    summary: resume.summary,
    phone: resume.phone,
    location: resume.location,
    linkedinUrl: resume.linkedinUrl,
    githubUrl: resume.githubUrl,
    portfolioUrl: resume.portfolioUrl,
    contactName: user.name,
    contactEmail: user.email,
    education: resume.education.map((e) => ({
      id: e.id,
      school: e.school,
      degree: e.degree,
      fieldOfStudy: e.fieldOfStudy,
      startDate: toDateLabel(e.startDate),
      endDate: toDateLabel(e.endDate),
      current: e.current,
      description: e.description,
    })),
    experience: resume.experience.map((e) => ({
      id: e.id,
      company: e.company,
      role: e.role,
      location: e.location,
      startDate: toDateLabel(e.startDate),
      endDate: toDateLabel(e.endDate),
      current: e.current,
      description: e.description,
    })),
    skills: resume.skills.map((s) => ({ id: s.id, name: s.name })),
    projects: resume.projects.map((p) => ({ id: p.id, title: p.title, url: p.url, description: p.description })),
    certificates: certificates.map((c) => ({
      id: c.id,
      courseTitle: c.courseTitle,
      dateIssued: c.dateIssued.toISOString(),
    })),
  };
}

async function getOwnedResumeId(userId: string): Promise<string> {
  const resume = await prisma.resume.upsert({
    where: { userId },
    create: { userId },
    update: {},
    select: { id: true },
  });
  return resume.id;
}

function parseOptionalDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

// ---------- Resume details ----------

export type ResumeDetailsInput = {
  headline: string;
  summary: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
};

export async function updateResumeDetailsAction(input: ResumeDetailsInput): Promise<ActionResult> {
  const { userId } = await verifySession();
  const resumeId = await getOwnedResumeId(userId);

  await prisma.resume.update({
    where: { id: resumeId },
    data: {
      headline: input.headline.trim(),
      summary: input.summary.trim(),
      phone: input.phone.trim(),
      location: input.location.trim(),
      linkedinUrl: input.linkedinUrl.trim(),
      githubUrl: input.githubUrl.trim(),
      portfolioUrl: input.portfolioUrl.trim(),
    },
  });

  revalidatePath("/cv-builder");
  return { success: true };
}

// ---------- Education ----------

export type EducationInput = {
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string | null;
  endDate: string | null;
  current: boolean;
  description: string;
};

async function assertOwnedEducation(id: string, userId: string) {
  const row = await prisma.resumeEducation.findUnique({ where: { id }, include: { resume: true } });
  if (!row || row.resume.userId !== userId) throw new Error("Education entry not found");
  return row;
}

export async function addEducationAction(input: EducationInput): Promise<ActionResult> {
  const { userId } = await verifySession();
  const resumeId = await getOwnedResumeId(userId);

  const last = await prisma.resumeEducation.findFirst({ where: { resumeId }, orderBy: { sortOrder: "desc" } });

  await prisma.resumeEducation.create({
    data: {
      resumeId,
      school: input.school.trim(),
      degree: input.degree.trim(),
      fieldOfStudy: input.fieldOfStudy.trim(),
      startDate: parseOptionalDate(input.startDate),
      endDate: input.current ? null : parseOptionalDate(input.endDate),
      current: input.current,
      description: input.description.trim(),
      sortOrder: (last?.sortOrder ?? -1) + 1,
    },
  });

  revalidatePath("/cv-builder");
  return { success: true };
}

export async function updateEducationAction(id: string, input: EducationInput): Promise<ActionResult> {
  const { userId } = await verifySession();
  await assertOwnedEducation(id, userId);

  await prisma.resumeEducation.update({
    where: { id },
    data: {
      school: input.school.trim(),
      degree: input.degree.trim(),
      fieldOfStudy: input.fieldOfStudy.trim(),
      startDate: parseOptionalDate(input.startDate),
      endDate: input.current ? null : parseOptionalDate(input.endDate),
      current: input.current,
      description: input.description.trim(),
    },
  });

  revalidatePath("/cv-builder");
  return { success: true };
}

export async function deleteEducationAction(id: string): Promise<void> {
  const { userId } = await verifySession();
  await assertOwnedEducation(id, userId);
  await prisma.resumeEducation.delete({ where: { id } });
  revalidatePath("/cv-builder");
}

// ---------- Experience ----------

export type ExperienceInput = {
  company: string;
  role: string;
  location: string;
  startDate: string | null;
  endDate: string | null;
  current: boolean;
  description: string;
};

async function assertOwnedExperience(id: string, userId: string) {
  const row = await prisma.resumeExperience.findUnique({ where: { id }, include: { resume: true } });
  if (!row || row.resume.userId !== userId) throw new Error("Experience entry not found");
  return row;
}

export async function addExperienceAction(input: ExperienceInput): Promise<ActionResult> {
  const { userId } = await verifySession();
  const resumeId = await getOwnedResumeId(userId);

  const last = await prisma.resumeExperience.findFirst({ where: { resumeId }, orderBy: { sortOrder: "desc" } });

  await prisma.resumeExperience.create({
    data: {
      resumeId,
      company: input.company.trim(),
      role: input.role.trim(),
      location: input.location.trim(),
      startDate: parseOptionalDate(input.startDate),
      endDate: input.current ? null : parseOptionalDate(input.endDate),
      current: input.current,
      description: input.description.trim(),
      sortOrder: (last?.sortOrder ?? -1) + 1,
    },
  });

  revalidatePath("/cv-builder");
  return { success: true };
}

export async function updateExperienceAction(id: string, input: ExperienceInput): Promise<ActionResult> {
  const { userId } = await verifySession();
  await assertOwnedExperience(id, userId);

  await prisma.resumeExperience.update({
    where: { id },
    data: {
      company: input.company.trim(),
      role: input.role.trim(),
      location: input.location.trim(),
      startDate: parseOptionalDate(input.startDate),
      endDate: input.current ? null : parseOptionalDate(input.endDate),
      current: input.current,
      description: input.description.trim(),
    },
  });

  revalidatePath("/cv-builder");
  return { success: true };
}

export async function deleteExperienceAction(id: string): Promise<void> {
  const { userId } = await verifySession();
  await assertOwnedExperience(id, userId);
  await prisma.resumeExperience.delete({ where: { id } });
  revalidatePath("/cv-builder");
}

// ---------- Skills ----------

export async function addSkillAction(name: string): Promise<ActionResult> {
  const trimmed = name.trim();
  if (!trimmed) return { success: false, error: "Skill cannot be empty" };

  const { userId } = await verifySession();
  const resumeId = await getOwnedResumeId(userId);

  const last = await prisma.resumeSkill.findFirst({ where: { resumeId }, orderBy: { sortOrder: "desc" } });
  await prisma.resumeSkill.create({
    data: { resumeId, name: trimmed, sortOrder: (last?.sortOrder ?? -1) + 1 },
  });

  revalidatePath("/cv-builder");
  return { success: true };
}

export async function deleteSkillAction(id: string): Promise<void> {
  const { userId } = await verifySession();
  const row = await prisma.resumeSkill.findUnique({ where: { id }, include: { resume: true } });
  if (!row || row.resume.userId !== userId) throw new Error("Skill not found");
  await prisma.resumeSkill.delete({ where: { id } });
  revalidatePath("/cv-builder");
}

// ---------- Projects ----------

export type ProjectInput = { title: string; url: string; description: string };

async function assertOwnedProject(id: string, userId: string) {
  const row = await prisma.resumeProject.findUnique({ where: { id }, include: { resume: true } });
  if (!row || row.resume.userId !== userId) throw new Error("Project not found");
  return row;
}

export async function addProjectAction(input: ProjectInput): Promise<ActionResult> {
  const { userId } = await verifySession();
  const resumeId = await getOwnedResumeId(userId);

  const last = await prisma.resumeProject.findFirst({ where: { resumeId }, orderBy: { sortOrder: "desc" } });

  await prisma.resumeProject.create({
    data: {
      resumeId,
      title: input.title.trim(),
      url: input.url.trim(),
      description: input.description.trim(),
      sortOrder: (last?.sortOrder ?? -1) + 1,
    },
  });

  revalidatePath("/cv-builder");
  return { success: true };
}

export async function updateProjectAction(id: string, input: ProjectInput): Promise<ActionResult> {
  const { userId } = await verifySession();
  await assertOwnedProject(id, userId);

  await prisma.resumeProject.update({
    where: { id },
    data: {
      title: input.title.trim(),
      url: input.url.trim(),
      description: input.description.trim(),
    },
  });

  revalidatePath("/cv-builder");
  return { success: true };
}

export async function deleteProjectAction(id: string): Promise<void> {
  const { userId } = await verifySession();
  await assertOwnedProject(id, userId);
  await prisma.resumeProject.delete({ where: { id } });
  revalidatePath("/cv-builder");
}
