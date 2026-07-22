"use client";

import { MobileNav } from "@/components/MobileNav";
import { SearchCommand } from "@/components/SearchCommand";
import { ProgramSwitcher } from "@/components/ProgramSwitcher";
import { NotificationsMenu } from "@/components/NotificationsMenu";
import { UserMenu } from "@/components/UserMenu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useGamification } from "@/lib/useGamification";
import { useCurrentUser } from "@/lib/user-context";

export function TopBar({ logoUrl }: { logoUrl?: string | null }) {
  const gamification = useGamification();
  const user = useCurrentUser();
  const firstName = user.name.split(" ")[0];

  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-line bg-surface px-4 py-3.5 md:px-6 lg:px-8">
      <MobileNav logoUrl={logoUrl} />

      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-slate-800">
          Welcome, {firstName}, to the e-Learning Centre!
        </p>
        <div className="flex items-center gap-1 text-xs text-muted">
          <span className="truncate">What would you like to study today?</span>
          <ProgramSwitcher />
        </div>
      </div>

      <div className="mx-auto hidden max-w-md flex-1 lg:block">
        <SearchCommand />
      </div>

      <div className="ml-auto flex items-center gap-3">
        {gamification.ready && gamification.streak > 0 && (
          <div
            className="flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-600 border border-orange-200/50"
            title="Daily study streak!"
          >
            <span className="animate-bounce">🔥</span>
            <span>{gamification.streak} Day{gamification.streak !== 1 ? "s" : ""}</span>
          </div>
        )}

        {gamification.ready && (
          <div
            className="hidden items-center gap-2 rounded-full border border-line bg-surface px-2.5 py-1 text-xs md:flex"
            title={`XP: ${gamification.xp} (${gamification.xpToNextLevel} XP to next level)`}
          >
            <span className="font-bold text-navy">Lvl {gamification.level}</span>
            <div className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-navy transition-all"
                style={{ width: `${gamification.levelProgress}%` }}
              />
            </div>
          </div>
        )}

        <ThemeToggle />
        <NotificationsMenu />
        <UserMenu />
      </div>
    </header>
  );
}

