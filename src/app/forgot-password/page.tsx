import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";
import { getPublicBrandingSettings } from "@/app/actions/settings";

// See src/app/login/page.tsx for why this is forced dynamic.
export const dynamic = "force-dynamic";

export default async function ForgotPasswordPage() {
  const branding = await getPublicBrandingSettings();
  return <ForgotPasswordForm logoUrl={branding.headerLogo} />;
}
