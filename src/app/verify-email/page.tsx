import { VerifyEmailForm } from "@/components/VerifyEmailForm";
import { getPublicBrandingSettings } from "@/app/actions/settings";

// See src/app/login/page.tsx for why this is forced dynamic.
export const dynamic = "force-dynamic";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const [{ email }, branding] = await Promise.all([searchParams, getPublicBrandingSettings()]);
  return <VerifyEmailForm email={email ?? ""} logoUrl={branding.headerLogo} />;
}
