import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { Toaster } from "@/components/Toaster";
import { getCurrentUser } from "@/lib/dal";
import { getPublicBrandingSettings } from "@/app/actions/settings";
import { UserProvider } from "@/lib/user-context";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, branding] = await Promise.all([getCurrentUser(), getPublicBrandingSettings()]);

  return (
    <UserProvider user={user}>
      <div className="flex min-h-screen bg-background">
        <Sidebar logoUrl={branding.dashboardLogo} siteName={branding.siteName} />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar logoUrl={branding.dashboardLogo} siteName={branding.siteName} />
          <main className="min-w-0 flex-1 p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
        </div>
        <Toaster />
      </div>
    </UserProvider>
  );
}
