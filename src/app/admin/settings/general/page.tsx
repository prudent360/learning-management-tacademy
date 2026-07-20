import { requireAdmin } from "@/lib/dal";
import { getGeneralSettings } from "@/app/actions/settings";
import { GeneralSettingsForm } from "@/components/settings/GeneralSettingsForm";

export default async function GeneralSettingsPage() {
  await requireAdmin();
  const settings = await getGeneralSettings();
  return <GeneralSettingsForm initial={settings} />;
}
