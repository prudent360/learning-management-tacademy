"use server";

import * as z from "zod";
import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin, getOptionalSession } from "@/lib/dal";
import { sendTemplatedEmail } from "@/lib/email";
import { getAppUrl } from "@/lib/app-url";
import { revalidatePath } from "next/cache";
import { GATEWAY_IDS, GATEWAY_LABELS, type GatewayId } from "@/lib/payment-gateways";
import { SUPPORTED_CURRENCIES, CURRENCY_LABELS } from "@/lib/currency";
import { getCurrencyForCountry } from "@/lib/countries";

export type { GatewayId } from "@/lib/payment-gateways";

type ActionResult = { success: true } | { success: false; error: string };

// ---------- General ----------

const GeneralSchema = z.object({
  siteName: z.string().trim().min(1, { error: "Site name is required." }),
  supportEmail: z.email({ error: "Enter a valid support email." }).trim(),
  timezone: z.string().trim().min(1, { error: "Timezone is required." }),
  maintenanceMode: z.boolean(),
});
export type GeneralSettingsInput = z.infer<typeof GeneralSchema>;

export async function getGeneralSettings(): Promise<GeneralSettingsInput> {
  await requireAdmin();
  const row = await prisma.generalSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
  return {
    siteName: row.siteName,
    supportEmail: row.supportEmail,
    timezone: row.timezone,
    maintenanceMode: row.maintenanceMode,
  };
}

export async function updateGeneralSettings(input: GeneralSettingsInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = GeneralSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  await prisma.generalSettings.upsert({
    where: { id: 1 },
    update: parsed.data,
    create: { id: 1, ...parsed.data },
  });
  revalidatePath("/admin/settings/general");
  revalidatePath("/", "layout");
  return { success: true };
}

// ---------- Payment ----------

// ---------- Order currency (what every course price is denominated in) ----------

const OrderCurrencySchema = z.object({
  currency: z.string().trim().length(3, { error: "Use a 3-letter currency code." }).toUpperCase(),
});
export type OrderCurrencyInput = z.infer<typeof OrderCurrencySchema>;

export async function getOrderCurrency(): Promise<OrderCurrencyInput> {
  await requireAdmin();
  const row = await prisma.paymentSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
  return { currency: row.currency };
}

export async function updateOrderCurrency(input: OrderCurrencyInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = OrderCurrencySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  await prisma.paymentSettings.upsert({
    where: { id: 1 },
    update: { currency: parsed.data.currency },
    create: { id: 1, currency: parsed.data.currency },
  });
  revalidatePath("/admin/settings/payment");
  return { success: true };
}

// ---------- Payment gateways (Fincra, Paystack — each independently toggleable) ----------

const GatewaySchema = z.object({
  id: z.enum(GATEWAY_IDS),
  enabled: z.boolean(),
  mode: z.enum(["test", "live"]),
  currencies: z.array(z.string().trim().length(3).toUpperCase()).optional(),
  testPublicKey: z.string().trim().optional(),
  testSecretKey: z.string().trim().optional(),
  clearTestSecretKey: z.boolean().optional(),
  livePublicKey: z.string().trim().optional(),
  liveSecretKey: z.string().trim().optional(),
  clearLiveSecretKey: z.boolean().optional(),
  webhookSecret: z.string().trim().optional(),
  clearWebhookSecret: z.boolean().optional(),
  encryptionKey: z.string().trim().optional(),
  clearEncryptionKey: z.boolean().optional(),
  businessId: z.string().trim().optional(),
});
export type GatewayInput = z.infer<typeof GatewaySchema>;

export type GatewayView = {
  id: GatewayId;
  enabled: boolean;
  mode: "test" | "live";
  currencies: string[];
  testPublicKey: string;
  hasTestSecretKey: boolean;
  livePublicKey: string;
  hasLiveSecretKey: boolean;
  hasWebhookSecret: boolean;
  hasEncryptionKey: boolean;
  businessId: string;
};

export async function listPaymentGateways(): Promise<GatewayView[]> {
  await requireAdmin();
  const rows = await Promise.all(
    GATEWAY_IDS.map((id) => prisma.paymentGateway.upsert({ where: { id }, update: {}, create: { id } }))
  );
  return rows.map((row) => ({
    id: row.id as GatewayId,
    enabled: row.enabled,
    mode: row.mode === "live" ? "live" : "test",
    currencies: row.currencies ? row.currencies.split(",").filter(Boolean) : [],
    testPublicKey: row.testPublicKey,
    hasTestSecretKey: row.testSecretKey.length > 0,
    livePublicKey: row.livePublicKey,
    hasLiveSecretKey: row.liveSecretKey.length > 0,
    hasWebhookSecret: row.webhookSecret.length > 0,
    hasEncryptionKey: row.encryptionKey.length > 0,
    businessId: row.businessId,
  }));
}

export async function updatePaymentGateway(input: GatewayInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = GatewaySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  const {
    id,
    enabled,
    mode,
    currencies,
    testPublicKey,
    testSecretKey,
    clearTestSecretKey,
    livePublicKey,
    liveSecretKey,
    clearLiveSecretKey,
    webhookSecret,
    clearWebhookSecret,
    encryptionKey,
    clearEncryptionKey,
    businessId,
  } = parsed.data;

  // Public keys/currencies/mode/enabled are never sensitive, so they're always
  // overwritten as submitted. Secret fields follow the existing convention:
  // blank = no change, explicit clear flag = set to "".
  const data: Prisma.PaymentGatewayUpdateInput = {
    enabled,
    mode,
    currencies: currencies && currencies.length > 0 ? currencies.join(",") : "",
  };
  if (testPublicKey !== undefined) data.testPublicKey = testPublicKey;
  if (livePublicKey !== undefined) data.livePublicKey = livePublicKey;
  if (testSecretKey) data.testSecretKey = testSecretKey;
  else if (clearTestSecretKey) data.testSecretKey = "";
  if (liveSecretKey) data.liveSecretKey = liveSecretKey;
  else if (clearLiveSecretKey) data.liveSecretKey = "";
  if (webhookSecret) data.webhookSecret = webhookSecret;
  else if (clearWebhookSecret) data.webhookSecret = "";
  if (encryptionKey) data.encryptionKey = encryptionKey;
  else if (clearEncryptionKey) data.encryptionKey = "";
  if (businessId !== undefined) data.businessId = businessId;

  await prisma.paymentGateway.upsert({
    where: { id },
    update: data,
    create: {
      id,
      enabled,
      mode,
      currencies: data.currencies as string,
      testPublicKey: testPublicKey ?? "",
      testSecretKey: testSecretKey ?? "",
      livePublicKey: livePublicKey ?? "",
      liveSecretKey: liveSecretKey ?? "",
      webhookSecret: webhookSecret ?? "",
      encryptionKey: encryptionKey ?? "",
      businessId: businessId ?? "",
    },
  });
  revalidatePath("/admin/settings/payment");
  return { success: true };
}

/** Non-admin: the enabled, currency-compatible gateways to offer at checkout — no keys exposed. */
export type CheckoutGateway = { id: GatewayId; label: string };

export async function getPaymentConfig(): Promise<{ currency: string; gateways: CheckoutGateway[] }> {
  try {
    const [settings, gateways] = await Promise.all([
      prisma.paymentSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } }),
      prisma.paymentGateway.findMany({ where: { enabled: true } }),
    ]);

    const currency = settings.currency;
    const compatible = gateways.filter((g) => {
      const list = g.currencies ? g.currencies.split(",").filter(Boolean) : [];
      return list.length === 0 || list.includes(currency);
    });

    return {
      currency,
      gateways: compatible.map((g) => ({
        id: g.id as GatewayId,
        label: GATEWAY_LABELS[g.id as GatewayId] ?? g.id,
      })),
    };
  } catch {
    return { currency: "NGN", gateways: [] };
  }
}

// ---------- Currency conversion rates (display-only price estimates) ----------

export type CurrencyRateRow = { code: string; label: string; rate: number | null };

/** Admin: the base order currency plus every other supported currency and its rate (null = not set yet). */
export async function getCurrencyRates(): Promise<{
  baseCurrency: string;
  rates: CurrencyRateRow[];
}> {
  await requireAdmin();
  const [settings, rows] = await Promise.all([
    prisma.paymentSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } }),
    prisma.currencyRate.findMany(),
  ]);

  const rateByCode = new Map(rows.map((r) => [r.code, r.rate]));
  const rates = SUPPORTED_CURRENCIES.filter((code) => code !== settings.currency).map((code) => ({
    code,
    label: CURRENCY_LABELS[code] ?? code,
    rate: rateByCode.get(code) ?? null,
  }));

  return { baseCurrency: settings.currency, rates };
}

const CurrencyRatesSchema = z.array(
  z.object({
    code: z.string(),
    rate: z.number().positive({ error: "Rate must be a positive number." }).nullable(),
  }),
);

export async function updateCurrencyRates(
  input: z.infer<typeof CurrencyRatesSchema>,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = CurrencyRatesSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  await Promise.all(
    parsed.data.map(({ code, rate }) =>
      rate === null
        ? prisma.currencyRate.deleteMany({ where: { code } })
        : prisma.currencyRate.upsert({
            where: { code },
            update: { rate },
            create: { code, label: CURRENCY_LABELS[code] ?? code, rate },
          }),
    ),
  );

  revalidatePath("/admin/settings/currency");
  return { success: true };
}

/** Non-admin: the current student's local-currency estimate context, derived from their profile country. Null fields mean "no conversion available — just show the base price." */
export async function getStudentCurrencyContext(): Promise<{
  baseCurrency: string;
  displayCurrency: string | null;
  rate: number | null;
}> {
  try {
    const session = await getOptionalSession();
    const settings = await prisma.paymentSettings.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 },
    });
    const baseCurrency = settings.currency;

    if (!session) return { baseCurrency, displayCurrency: null, rate: null };

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { country: true },
    });
    const targetCurrency = user?.country ? getCurrencyForCountry(user.country) : undefined;
    if (!targetCurrency || targetCurrency === baseCurrency) {
      return { baseCurrency, displayCurrency: null, rate: null };
    }

    const rateRow = await prisma.currencyRate.findUnique({ where: { code: targetCurrency } });
    if (!rateRow) return { baseCurrency, displayCurrency: null, rate: null };

    return { baseCurrency, displayCurrency: targetCurrency, rate: rateRow.rate };
  } catch {
    return { baseCurrency: "NGN", displayCurrency: null, rate: null };
  }
}

// ---------- SMTP ----------

const SmtpSchema = z.object({
  host: z.string().trim(),
  port: z.number().int().min(1).max(65535),
  username: z.string().trim(),
  fromName: z.string().trim(),
  // Relaxed to a plain trimmed string (not z.email()) since SMTP "from"
  // addresses may legitimately be entered in forms we shouldn't over-reject.
  fromEmail: z.string().trim(),
  secure: z.boolean(),
  password: z.string().trim().optional(),
  clearPassword: z.boolean().optional(),
});
export type SmtpSettingsInput = z.infer<typeof SmtpSchema>;

export type SmtpSettingsView = {
  host: string;
  port: number;
  username: string;
  fromName: string;
  fromEmail: string;
  secure: boolean;
  hasPassword: boolean;
};

export async function getSmtpSettings(): Promise<SmtpSettingsView> {
  await requireAdmin();
  const row = await prisma.smtpSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
  return {
    host: row.host,
    port: row.port,
    username: row.username,
    fromName: row.fromName,
    fromEmail: row.fromEmail,
    secure: row.secure,
    hasPassword: row.password.length > 0,
  };
}

export async function updateSmtpSettings(input: SmtpSettingsInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = SmtpSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  const { password, clearPassword, ...rest } = parsed.data;

  const data: { password?: string } = {};
  if (password) data.password = password;
  else if (clearPassword) data.password = "";

  await prisma.smtpSettings.upsert({
    where: { id: 1 },
    update: { ...rest, ...data },
    create: { id: 1, ...rest, password: password ?? "" },
  });
  revalidatePath("/admin/settings/smtp");
  return { success: true };
}

// ---------- Email templates ----------

const TemplateSchema = z.object({
  key: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
      error: "Key must be lowercase letters, numbers, and hyphens only.",
    }),
  name: z.string().trim().min(1, { error: "Name is required." }),
  description: z.string().trim(),
  subject: z.string().trim().min(1, { error: "Subject is required." }),
  body: z.string().trim().min(1, { error: "Body is required." }),
});
export type EmailTemplateInput = z.infer<typeof TemplateSchema>;

export async function listEmailTemplates() {
  await requireAdmin();
  return prisma.emailTemplate.findMany({
    select: { key: true, name: true, description: true, subject: true, body: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getEmailTemplate(key: string) {
  await requireAdmin();
  return prisma.emailTemplate.findUnique({ where: { key } });
}

export async function saveEmailTemplateAction(input: EmailTemplateInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = TemplateSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  const { key, ...rest } = parsed.data;

  await prisma.emailTemplate.upsert({
    where: { key },
    update: rest,
    create: { key, ...rest },
  });
  revalidatePath("/admin/settings/email-templates");
  return { success: true };
}

export async function deleteEmailTemplateAction(key: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.emailTemplate.delete({ where: { key } });
  revalidatePath("/admin/settings/email-templates");
  return { success: true };
}

// ---------- Branding ----------

export type BrandingSlot = "header" | "footer" | "dashboard" | "invoice" | "favicon";

export type BrandingSettingsView = {
  siteName: string;
  headerLogo: string | null;
  footerLogo: string | null;
  dashboardLogo: string | null;
  invoiceLogo: string | null;
  faviconLogo: string | null;
};

type BrandingField = "headerLogo" | "footerLogo" | "dashboardLogo" | "invoiceLogo" | "faviconLogo";

function brandingField(slot: BrandingSlot): BrandingField {
  switch (slot) {
    case "header":
      return "headerLogo";
    case "footer":
      return "footerLogo";
    case "dashboard":
      return "dashboardLogo";
    case "invoice":
      return "invoiceLogo";
    case "favicon":
      return "faviconLogo";
  }
}

// Only raster formats — SVG is deliberately excluded since it can carry
// embedded scripts and these files are served back as public static assets.
const ALLOWED_LOGO_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};
const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "branding");

export async function getBrandingSettings(): Promise<BrandingSettingsView> {
  await requireAdmin();
  const [row, general] = await Promise.all([
    prisma.brandingSettings.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 },
    }),
    prisma.generalSettings.findUnique({ where: { id: 1 } }),
  ]);
  return {
    siteName: general?.siteName ?? "TekSkillUp",
    headerLogo: row.headerLogo,
    footerLogo: row.footerLogo,
    dashboardLogo: row.dashboardLogo,
    invoiceLogo: row.invoiceLogo,
    faviconLogo: row.faviconLogo,
  };
}

/** Unauthenticated read for rendering the logo on public/student-facing pages — these are public brand assets, not sensitive data. */
export async function getPublicBrandingSettings(): Promise<BrandingSettingsView> {
  try {
    const [row, general] = await Promise.all([
      prisma.brandingSettings.findUnique({ where: { id: 1 } }),
      prisma.generalSettings.findUnique({ where: { id: 1 } }),
    ]);
    return {
      siteName: general?.siteName ?? "TekSkillUp",
      headerLogo: row?.headerLogo ?? null,
      footerLogo: row?.footerLogo ?? null,
      dashboardLogo: row?.dashboardLogo ?? null,
      invoiceLogo: row?.invoiceLogo ?? null,
      faviconLogo: row?.faviconLogo ?? null,
    };
  } catch {
    return {
      siteName: "TekSkillUp",
      headerLogo: null,
      footerLogo: null,
      dashboardLogo: null,
      invoiceLogo: null,
      faviconLogo: null,
    };
  }
}

export async function uploadBrandingLogoAction(
  slot: BrandingSlot,
  formData: FormData
): Promise<ActionResult & { path?: string }> {
  await requireAdmin();
  const field = brandingField(slot);

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Choose an image file to upload." };
  }
  if (file.size > MAX_LOGO_BYTES) {
    return { success: false, error: "Image must be 2MB or smaller." };
  }
  const ext = ALLOWED_LOGO_TYPES[file.type];
  if (!ext) {
    return { success: false, error: "Only PNG, JPEG, or WEBP images are allowed." };
  }

  const current = await prisma.brandingSettings.findUnique({ where: { id: 1 } });
  const previousPath = current?.[field] ?? null;

  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${slot}-${randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), bytes);
  const publicPath = `/uploads/branding/${filename}`;

  await prisma.brandingSettings.upsert({
    where: { id: 1 },
    update: { [field]: publicPath },
    create: { id: 1, [field]: publicPath },
  });

  if (previousPath) {
    await unlink(path.join(process.cwd(), "public", previousPath)).catch(() => {});
  }

  revalidatePath("/admin/settings/branding");
  return { success: true, path: publicPath };
}

export async function removeBrandingLogoAction(slot: BrandingSlot): Promise<ActionResult> {
  await requireAdmin();
  const field = brandingField(slot);

  const current = await prisma.brandingSettings.findUnique({ where: { id: 1 } });
  const previousPath = current?.[field] ?? null;

  await prisma.brandingSettings.upsert({
    where: { id: 1 },
    update: { [field]: null },
    create: { id: 1 },
  });

  if (previousPath) {
    await unlink(path.join(process.cwd(), "public", previousPath)).catch(() => {});
  }

  revalidatePath("/admin/settings/branding");
  return { success: true };
}

async function getSampleTemplateData(): Promise<Record<string, string>> {
  const appUrl = await getAppUrl();
  return {
    "{{user_name}}": "John Doe",
    "{{user_email}}": "john.doe@example.com",
    "{{course_title}}": "Full-Stack Web Development",
    "{{site_name}}": "TekSkillUp",
    "{{support_email}}": "support@tekskillup.com",
    // Real app domain, not the marketing site — "Send Test"/preview buttons
    // must point where a real login page actually lives.
    "{{login_url}}": `${appUrl}/login`,
  };
}

export async function sendTestEmailAction(key: string, toEmail: string): Promise<ActionResult> {
  await requireAdmin();
  const result = await sendTemplatedEmail(key, toEmail, await getSampleTemplateData());
  if (!result.success) {
    return {
      success: false,
      error:
        result.error === "SMTP connection is not configured yet."
          ? "SMTP connection is not configured yet. Go to the SMTP tab to set it up."
          : result.error,
    };
  }
  return { success: true };
}
