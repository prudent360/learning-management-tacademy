import { requireAdmin } from "@/lib/dal";
import { PageHeader } from "@/components/PageHeader";
import { SettingsSubNav } from "@/components/settings/SettingsSubNav";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin(); // independent check, matching this codebase's defense-in-depth convention
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Payment, email, and general configuration." />
      <SettingsSubNav />
      {children}
    </div>
  );
}
