"use server";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";
import {
  SignupFormSchema,
  LoginFormSchema,
  type FormState,
  type VerifyEmailFormState,
} from "@/lib/definitions";
import { getTodayString } from "@/lib/date";
import { sendTemplatedEmail } from "@/lib/email";
import { checkRateLimit, getClientIp, rateLimitMessage } from "@/lib/rate-limit";
import { getAppUrl } from "@/lib/app-url";

const VERIFICATION_CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const VERIFICATION_EMAIL_TEMPLATE_KEY = "email-verification-otp";

function generateVerificationCode(): string {
  return String(crypto.randomInt(100000, 1000000));
}

async function ensureVerificationEmailTemplate() {
  await prisma.emailTemplate.upsert({
    where: { key: VERIFICATION_EMAIL_TEMPLATE_KEY },
    update: {},
    create: {
      key: VERIFICATION_EMAIL_TEMPLATE_KEY,
      name: "Email Verification Code",
      description: "Sent to a user to verify their email address at signup or login",
      subject: "Your {{site_name}} verification code",
      body:
        "<p>Hi {{user_name}},</p>" +
        "<p>Your verification code is:</p>" +
        "<p style=\"font-size:28px;font-weight:bold;letter-spacing:4px;\">{{code}}</p>" +
        "<p>This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>" +
        "<p>— The {{site_name}} Team</p>",
    },
  });
}

async function sendVerificationCode(userId: string, name: string, email: string) {
  const code = generateVerificationCode();
  const expires = new Date(Date.now() + VERIFICATION_CODE_TTL_MS);

  await prisma.user.update({
    where: { id: userId },
    data: { verificationCode: code, verificationCodeExpires: expires },
  });

  await ensureVerificationEmailTemplate();
  const general = await prisma.generalSettings.findUnique({ where: { id: 1 } });

  return sendTemplatedEmail(VERIFICATION_EMAIL_TEMPLATE_KEY, email, {
    "{{user_name}}": name,
    "{{code}}": code,
    "{{site_name}}": general?.siteName || "TekSkillUp",
  });
}

export async function signup(_state: FormState, formData: FormData): Promise<FormState> {
  const rawFirstName = String(formData.get("firstName") ?? "");
  const rawMiddleName = String(formData.get("middleName") ?? "");
  const rawLastName = String(formData.get("lastName") ?? "");
  const rawGender = String(formData.get("gender") ?? "");
  const rawHearAboutUs = String(formData.get("hearAboutUs") ?? "");
  const rawEmail = String(formData.get("email") ?? "");

  const echoValues = {
    firstName: rawFirstName,
    middleName: rawMiddleName,
    lastName: rawLastName,
    gender: rawGender,
    hearAboutUs: rawHearAboutUs,
    email: rawEmail,
  };

  const ip = await getClientIp();
  const ipLimit = checkRateLimit(`signup:ip:${ip}`, 5, 60 * 60 * 1000);
  if (!ipLimit.allowed) {
    return { message: rateLimitMessage(ipLimit), values: echoValues };
  }

  const validatedFields = SignupFormSchema.safeParse({
    firstName: rawFirstName,
    middleName: rawMiddleName || undefined,
    lastName: rawLastName,
    gender: rawGender,
    hearAboutUs: rawHearAboutUs,
    email: rawEmail,
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      values: echoValues,
    };
  }

  const { firstName, middleName, lastName, gender, hearAboutUs, email, password } = validatedFields.data;
  const name = [firstName, middleName, lastName].filter(Boolean).join(" ");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return {
      errors: { email: ["An account with this email already exists."] },
      values: echoValues,
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        name,
        firstName,
        middleName: middleName || null,
        lastName,
        gender,
        hearAboutUs,
        email,
        passwordHash,
        emailVerified: false,
      },
    });
    await tx.gamification.create({
      data: { userId: created.id, xp: 0, streak: 1, lastActive: getTodayString() },
    });
    return created;
  });

  await sendVerificationCode(user.id, user.name, user.email);
  redirect(`/verify-email?email=${encodeURIComponent(user.email)}`);
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

  if (!user.emailVerified) {
    await sendVerificationCode(user.id, user.name, user.email);
    redirect(`/verify-email?email=${encodeURIComponent(user.email)}`);
  }

  await createSession(user.id);
  redirect("/dashboard");
}

export async function verifyEmailAction(
  _state: VerifyEmailFormState,
  formData: FormData
): Promise<VerifyEmailFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const code = String(formData.get("code") ?? "").trim();

  if (!email || !code) {
    return { error: "Enter the code sent to your email." };
  }

  const ip = await getClientIp();
  const ipLimit = checkRateLimit(`verify-email:ip:${ip}`, 20, 15 * 60 * 1000);
  if (!ipLimit.allowed) {
    return { error: rateLimitMessage(ipLimit) };
  }
  const emailLimit = checkRateLimit(`verify-email:email:${email}`, 10, 15 * 60 * 1000);
  if (!emailLimit.allowed) {
    return { error: rateLimitMessage(emailLimit) };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "We couldn't find an account with that email." };
  }
  if (user.emailVerified) {
    await createSession(user.id);
    redirect("/dashboard");
  }
  if (
    !user.verificationCode ||
    !user.verificationCodeExpires ||
    user.verificationCodeExpires < new Date()
  ) {
    return { error: "That code has expired. Request a new one below." };
  }
  if (user.verificationCode !== code) {
    return { error: "That code isn't right. Please check and try again." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, verificationCode: null, verificationCodeExpires: null },
  });

  await createSession(user.id);
  redirect("/dashboard");
}

export type ResendCodeResult = { success: true } | { success: false; error: string };

export async function resendVerificationCodeAction(email: string): Promise<ResendCodeResult> {
  const normalizedEmail = email.trim().toLowerCase();

  const ip = await getClientIp();
  const ipLimit = checkRateLimit(`resend-code:ip:${ip}`, 10, 15 * 60 * 1000);
  if (!ipLimit.allowed) {
    return { success: false, error: rateLimitMessage(ipLimit) };
  }
  const emailLimit = checkRateLimit(`resend-code:email:${normalizedEmail}`, 5, 15 * 60 * 1000);
  if (!emailLimit.allowed) {
    return { success: false, error: rateLimitMessage(emailLimit) };
  }

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    return { success: false, error: "We couldn't find an account with that email." };
  }
  if (user.emailVerified) {
    return { success: false, error: "This email is already verified — you can log in." };
  }

  const result = await sendVerificationCode(user.id, user.name, user.email);
  if (!result.success) {
    return { success: false, error: result.error };
  }
  return { success: true };
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

    const appUrl = await getAppUrl();
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
