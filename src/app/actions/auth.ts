"use server";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";
import { SignupFormSchema, LoginFormSchema, type FormState } from "@/lib/definitions";
import { getTodayString } from "@/lib/date";
import { sendTemplatedEmail } from "@/lib/email";
import { checkRateLimit, getClientIp, rateLimitMessage } from "@/lib/rate-limit";

export async function signup(_state: FormState, formData: FormData): Promise<FormState> {
  const rawName = String(formData.get("name") ?? "");
  const rawEmail = String(formData.get("email") ?? "");

  const ip = await getClientIp();
  const ipLimit = checkRateLimit(`signup:ip:${ip}`, 5, 60 * 60 * 1000);
  if (!ipLimit.allowed) {
    return { message: rateLimitMessage(ipLimit), values: { name: rawName, email: rawEmail } };
  }

  const validatedFields = SignupFormSchema.safeParse({
    name: rawName,
    email: rawEmail,
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      values: { name: rawName, email: rawEmail },
    };
  }

  const { name, email, password } = validatedFields.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return {
      errors: { email: ["An account with this email already exists."] },
      values: { name, email },
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: { name, email, passwordHash },
    });
    await tx.gamification.create({
      data: { userId: created.id, xp: 0, streak: 1, lastActive: getTodayString() },
    });
    return created;
  });

  await createSession(user.id);
  redirect("/dashboard");
}

export async function login(_state: FormState, formData: FormData): Promise<FormState> {
  const rawEmail = String(formData.get("email") ?? "");

  const validatedFields = LoginFormSchema.safeParse({
    email: rawEmail,
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      values: { email: rawEmail },
    };
  }

  const { email, password } = validatedFields.data;

  const ip = await getClientIp();
  const emailLimit = checkRateLimit(`login:email:${email}`, 10, 15 * 60 * 1000);
  if (!emailLimit.allowed) {
    return { message: rateLimitMessage(emailLimit), values: { email } };
  }
  const ipLimit = checkRateLimit(`login:ip:${ip}`, 30, 15 * 60 * 1000);
  if (!ipLimit.allowed) {
    return { message: rateLimitMessage(ipLimit), values: { email } };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { message: "Invalid email or password.", values: { email } };
  }

  const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordsMatch) {
    return { message: "Invalid email or password.", values: { email } };
  }

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

export async function forgotPassword(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email || !email.includes("@")) {
    return { errors: { email: ["Please enter a valid email address."] } };
  }

  // Rate limit silently: keep the response identical either way so it never
  // reveals whether an account exists or whether a limit was hit.
  const ip = await getClientIp();
  const ipLimit = checkRateLimit(`forgot:ip:${ip}`, 10, 60 * 60 * 1000);
  const emailLimit = checkRateLimit(`forgot:email:${email}`, 3, 60 * 60 * 1000);
  const rateLimited = !ipLimit.allowed || !emailLimit.allowed;

  const user = rateLimited ? null : await prisma.user.findUnique({ where: { email } });
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpires: expires },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetLink = `${appUrl}/reset-password?token=${token}`;
    const siteSettings = await prisma.generalSettings.findUnique({ where: { id: 1 } });
    const siteName = siteSettings?.siteName ?? "TekSkillUp";
    const supportEmail = siteSettings?.supportEmail ?? "support@tekskillup.com";

    await sendTemplatedEmail("password-reset", email, {
      user_name: user.name,
      user_email: user.email,
      site_name: siteName,
      login_url: resetLink,
      support_email: supportEmail,
    });
  }

  return {
    message: "If an account exists with that email, a password reset link has been sent.",
  };
}

export async function resetPassword(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!token) {
    return { message: "Reset token is missing. Please request a new link." };
  }

  if (password.length < 8) {
    return { errors: { password: ["Password must be at least 8 characters long."] } };
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return { errors: { password: ["Password must contain at least one letter and one number."] } };
  }

  if (password !== confirmPassword) {
    return { errors: { password: ["Passwords do not match."] } };
  }

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpires: { gt: new Date() },
    },
  });

  if (!user) {
    return { message: "Invalid or expired reset token. Please request a new link." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpires: null,
    },
  });

  return {
    message: "Password reset successfully! You can now log in.",
  };
}
