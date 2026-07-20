"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { revalidatePath } from "next/cache";

type ActionResult = { success: true } | { success: false; error: string };

export async function updateCertificateName(name: string): Promise<void> {
  const { userId } = await verifySession();
  const trimmed = name.trim();
  await prisma.user.update({
    where: { id: userId },
    data: { certificateName: trimmed.length > 0 ? trimmed : null },
  });
}

// ---------- Profile details ----------

export type ProfileData = {
  name: string;
  email: string;
  country: string | null;
};

export async function getProfile(): Promise<ProfileData> {
  const { userId } = await verifySession();
  return prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { name: true, email: true, country: true },
  });
}

const ProfileSchema = z.object({
  name: z.string().trim().min(1, { error: "Name is required." }),
  email: z.email({ error: "Enter a valid email address." }).trim(),
  country: z.string().trim().nullable(),
});
export type ProfileInput = z.infer<typeof ProfileSchema>;

export async function updateProfile(input: ProfileInput): Promise<ActionResult> {
  const { userId } = await verifySession();
  const parsed = ProfileSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const { name, email, country } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.id !== userId) {
    return { success: false, error: "That email is already in use." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { name, email, country: country || null },
  });

  revalidatePath("/profile");
  return { success: true };
}

// ---------- Password change ----------

const PasswordSchema = z.object({
  currentPassword: z.string().min(1, { error: "Enter your current password." }),
  newPassword: z.string().min(8, { error: "New password must be at least 8 characters." }),
});
export type PasswordInput = z.infer<typeof PasswordSchema>;

export async function changePassword(input: PasswordInput): Promise<ActionResult> {
  const { userId } = await verifySession();
  const parsed = PasswordSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const matches = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!matches) return { success: false, error: "Current password is incorrect." };

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  return { success: true };
}
