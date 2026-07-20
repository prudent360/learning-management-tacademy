import { requireAdmin } from "@/lib/dal";
import { getSmtpSettings } from "@/app/actions/settings";
import { SmtpSettingsForm } from "@/components/settings/SmtpSettingsForm";

export default async function SmtpSettingsPage() {
  await requireAdmin();
  const settings = await getSmtpSettings();
  return <SmtpSettingsForm initial={settings} />;
}
