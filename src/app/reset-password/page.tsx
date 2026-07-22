import { ResetPasswordForm } from "@/components/ResetPasswordForm";
import { getPublicBrandingSettings } from "@/app/actions/settings";

// See src/app/login/page.tsx for why this is forced dynamic.
export const dynamic = "force-dynamic";

export default async function ResetPasswordPage() {
  const branding = await getPublicBrandingSettings();
  return <ResetPasswordForm logoUrl={branding.headerLogo} siteName={branding.siteName} />;
}
