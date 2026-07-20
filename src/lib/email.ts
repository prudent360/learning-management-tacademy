import "server-only";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

export function renderTemplate(text: string, data: Record<string, string>): string {
  return text.replace(/\{\{[a-z_]+\}\}/g, (match) => data[match] ?? match);
}

export type SendTemplatedEmailResult = { success: true } | { success: false; error: string };

/**
 * Loads an EmailTemplate by key, interpolates `data` into its subject/body,
 * and sends it through the configured SmtpSettings. No auth check here —
 * callers (Server Actions) are responsible for their own authorization.
 */
export async function sendTemplatedEmail(
  templateKey: string,
  toEmail: string,
  data: Record<string, string>
): Promise<SendTemplatedEmailResult> {
  const tpl = await prisma.emailTemplate.findUnique({ where: { key: templateKey } });
  if (!tpl) return { success: false, error: "Template not found." };

  const smtp = await prisma.smtpSettings.findUnique({ where: { id: 1 } });
  if (!smtp || !smtp.host) {
    return { success: false, error: "SMTP connection is not configured yet." };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: {
        user: smtp.username,
        pass: smtp.password,
      },
      // Timeout settings so it fails fast if server is offline
      connectionTimeout: 5000,
      greetingTimeout: 5000,
    });

    await transporter.sendMail({
      from: `"${smtp.fromName}" <${smtp.fromEmail}>`,
      to: toEmail,
      subject: renderTemplate(tpl.subject, data),
      html: renderTemplate(tpl.body, data),
    });

    return { success: true };
  } catch (err: any) {
    console.error(`SMTP send failure (template "${templateKey}"):`, err);
    return { success: false, error: err.message || "Failed to deliver email through SMTP." };
  }
}
