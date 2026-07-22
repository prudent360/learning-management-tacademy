import { RegisterForm } from "@/components/RegisterForm";
import { getPublicBrandingSettings } from "@/app/actions/settings";

// See src/app/login/page.tsx for why this is forced dynamic.
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const branding = await getPublicBrandingSettings();
  return <RegisterForm logoUrl={branding.headerLogo} siteName={branding.siteName} />;
}
