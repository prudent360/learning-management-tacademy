"use client";

import { PageHeader } from "@/components/PageHeader";
import { ProgressRing } from "@/components/ProgressRing";
import { useGamification, BADGES } from "@/lib/useGamification";

export function AchievementsView() {
  const g = useGamification();
  const earned = g.badges.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Achievements"
        subtitle="Track your level, streak and the badges you've earned."
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="flex items-center gap-5 rounded-2xl bg-surface p-6">
          <ProgressRing
            value={g.ready ? Math.round(g.levelProgress) : 0}
            size={84}
            stroke={9}
            label={`Lvl ${g.ready ? g.level : "—"}`}
          />
          <div className="min-w-0">
            <p className="text-lg font-bold text-slate-800">
              {g.ready ? `${g.xp} XP earned` : "Loading…"}
            </p>
            <p className="text-sm text-muted">
              {g.ready
                ? `${g.xpToNextLevel} XP to reach Level ${g.level + 1}`
                : "Overall progress"}
            </p>
            <div className="mt-3 h-2 w-full max-w-xs overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-orange transition-all"
                style={{ width: `${g.ready ? g.levelProgress : 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-line bg-surface p-4">
            <p className="text-xs text-muted">Study streak</p>
            <p className="mt-1 flex items-center gap-1 text-2xl font-bold text-orange-600">
              <span aria-hidden>🔥</span>
              {g.ready ? g.streak : "—"}
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-4">
            <p className="text-xs text-muted">Badges</p>
            <p className="mt-1 text-2xl font-bold text-navy">
              {g.ready ? `${earned}/${BADGES.length}` : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Badge gallery */}
      <div className="rounded-2xl bg-surface p-5 md:p-6">
        <h2 className="mb-4 text-lg font-bold text-slate-800">Badges</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {BADGES.map((badge) => {
            const unlocked = g.ready && g.badges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`flex flex-col items-center rounded-xl border p-5 text-center transition-colors ${
                  unlocked
                    ? "border-orange/30 bg-orange-50"
                    : "border-line bg-surface-muted"
                }`}
              >
                <span
                  className={`grid h-16 w-16 place-items-center rounded-full text-3xl ${
                    unlocked ? "bg-surface shadow-sm" : "bg-slate-100 grayscale"
                  } ${unlocked ? "" : "opacity-50"}`}
                >
                  <span aria-hidden>{badge.icon}</span>
                </span>
                <p className="mt-3 text-sm font-bold text-slate-800">{badge.title}</p>
                <p className="mt-1 text-xs text-muted">{badge.description}</p>
                <span
                  className={`mt-3 rounded-full px-3 py-1 text-xs font-semibold ${
                    unlocked
                      ? "bg-brand-green/15 text-brand-green"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {unlocked ? "Unlocked" : "Locked"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
