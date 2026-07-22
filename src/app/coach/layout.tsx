import Link from "next/link";
import { requireCoach } from "@/lib/dal";
import { getMyCoachProfile } from "@/app/actions/coaches";
import { getPublicBrandingSettings } from "@/app/actions/settings";
import { Logo } from "@/components/Logo";
import { Avatar } from "@/components/Avatar";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { CalendarIcon, ClockIcon } from "@/components/icons";

export default async function CoachLayout({ children }: { children: React.ReactNode }) {
  await requireCoach();
  const [coach, branding] = await Promise.all([getMyCoachProfile(), getPublicBrandingSettings()]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-6">
            <Logo src={branding.dashboardLogo} />
            <nav className="flex items-center gap-1">
              <Link
                href="/coach"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-surface-muted"
              >
                <CalendarIcon className="h-4 w-4" />
                My Bookings
              </Link>
              <Link
                href="/coach/availability"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-surface-muted"
              >
                <ClockIcon className="h-4 w-4" />
                Availability
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              <Avatar name={coach.name} accent="navy" size={32} />
              <div>
                <p className="text-sm font-bold text-slate-800">{coach.name}</p>
                <p className="text-xs text-muted">{coach.role}</p>
              </div>
            </div>
            <AdminLogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6 md:px-6">{children}</main>
    </div>
  );
}
