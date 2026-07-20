"use server";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { credentialId } from "@/lib/certificate";
import { notify } from "@/lib/notify";

export async function issueCertificateAction(courseSlug: string, recipientName: string) {
  const { userId } = await verifySession();

  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
  });
  if (!course) throw new Error("Course not found");

  const name = recipientName.trim();
  const credId = credentialId(name, course.title);

  const existing = await prisma.certificate.findUnique({
    where: { userId_courseSlug: { userId, courseSlug } },
  });

  const cert = await prisma.certificate.upsert({
    where: { userId_courseSlug: { userId, courseSlug } },
    update: { id: credId, studentName: name },
    create: {
      id: credId,
      userId,
      courseSlug,
      studentName: name,
      courseTitle: course.title,
    },
  });

  if (!existing) {
    await notify(
      userId,
      "certificate",
      `Certificate earned for ${course.title}!`,
      `/verify/${cert.id}`,
    );
  }

  return { credentialId: cert.id };
}

export async function getCertificateAction(id: string) {
  const cert = await prisma.certificate.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!cert) return null;

  // Find course to get instructor
  const course = await prisma.course.findUnique({
    where: { slug: cert.courseSlug },
    select: { instructor: true },
  });

  return {
    id: cert.id,
    studentName: cert.studentName,
    courseTitle: cert.courseTitle,
    instructorName: course?.instructor ?? "Director of Learning",
    dateIssued: cert.dateIssued,
  };
}
