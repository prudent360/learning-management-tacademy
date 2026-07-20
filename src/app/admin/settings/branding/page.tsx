import { requireAdmin } from "@/lib/dal";
import { getBrandingSettings } from "@/app/actions/settings";
import { BrandingSettingsForm } from "@/components/settings/BrandingSettingsForm";

export default async function BrandingSettingsPage() {
  await requireAdmin(); // defense in depth, independent of the layout's own check
  const initial = await getBrandingSettings();
  return <BrandingSettingsForm initial={initial} />;
}
