"use client";

import React, { useState, useMemo } from "react";
import { levelFromXP, BADGES } from "@/lib/gamification";
import type { LeaderboardEntry } from "@/app/actions/gamification";
import { Avatar } from "@/components/Avatar";

type LeaderboardViewProps = {
  currentUserId: string;
  xpLeaderboard: LeaderboardEntry[];
  streakLeaderboard: LeaderboardEntry[];
};

export function LeaderboardView({
  currentUserId,
  xpLeaderboard,
  streakLeaderboard,
}: LeaderboardViewProps) {
  const [tab, setTab] = useState<"xp" | "streak">("xp");

  const activeLeaderboard = useMemo(() => {
    return tab === "xp" ? xpLeaderboard : streakLeaderboard;
  }, [tab, xpLeaderboard, streakLeaderboard]);

  // Top 3 Podium Users
  const podium = useMemo(() => {
    const first = activeLeaderboard.find((e) => e.rank === 1) || null;
    const second = activeLeaderboard.find((e) => e.rank === 2) || null;
    const third = activeLeaderboard.find((e) => e.rank === 3) || null;
    return { first, second, third };
  }, [activeLeaderboard]);

  // Rankings from 4th place onwards
  const remainingList = useMemo(() => {
    return activeLeaderboard.filter((e) => e.rank > 3);
  }, [activeLeaderboard]);

  // Logged-in user's entry
  const currentUserEntry = useMemo(() => {
    return activeLeaderboard.find((e) => e.userId === currentUserId) || null;
  }, [activeLeaderboard, currentUserId]);

  const renderBadge = (badgeId: string) => {
    const badge = BADGES.find((b) => b.id === badgeId);
    if (!badge) return null;
    return (
      <span
        key={badgeId}
        className="cursor-help text-base select-none"
        title={`${badge.title}: ${badge.description}`}
      >
        {badge.icon}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Tab Selector Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-xl bg-surface p-1 border border-line shadow-sm">
          <button
            onClick={() => setTab("xp")}
            className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition-all ${
              tab === "xp"
                ? "bg-navy text-white shadow-md"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            ⚡ Top Learners (XP)
          </button>
          <button
            onClick={() => setTab("streak")}
            className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition-all ${
              tab === "streak"
                ? "bg-navy text-white shadow-md"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            🔥 Streak Masters
          </button>
        </div>
      </div>

      {/* Podium Display (Top 3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-8 pb-4">
        {/* 2nd Place */}
        <div className="order-2 md:order-1 flex flex-col items-center">
          {podium.second ? (
            <div className="w-full text-center space-y-2">
              <div className="relative inline-block">
                <Avatar name={podium.second.name} size={64} accent="navy" />
                <span className="absolute -top-3 -right-2 bg-slate-300 border-2 border-white text-slate-800 text-[10px] font-extrabold h-6 w-6 rounded-full flex items-center justify-center shadow-sm">
                  2
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 truncate px-2">{podium.second.name}</p>
                <p className="text-xs text-muted">Level {levelFromXP(podium.second.xp)}</p>
                <div className="mt-1 flex justify-center gap-1">
                  {podium.second.badges.map((b) => renderBadge(b.badgeId))}
                </div>
              </div>
              <div className="h-28 w-full bg-gradient-to-t from-slate-200 to-slate-100 rounded-t-2xl flex flex-col justify-end p-3 border-t border-x border-slate-300/40">
                <span className="text-xs font-semibold text-slate-500">2nd Place</span>
                <span className="text-sm font-extrabold text-slate-800">
                  {tab === "xp" ? `${podium.second.xp} XP` : `${podium.second.streak} days`}
                </span>
              </div>
            </div>
          ) : (
            <div className="h-28 w-full bg-slate-100/50 border border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-xs text-slate-400">
              Empty Slot
            </div>
          )}
        </div>

        {/* 1st Place */}
        <div className="order-1 md:order-2 flex flex-col items-center">
          {podium.first ? (
            <div className="w-full text-center space-y-2 -translate-y-4">
              <div className="relative inline-block">
                {/* Crown Icon */}
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-2xl animate-bounce">
                  👑
                </div>
                <Avatar name={podium.first.name} size={80} accent="orange" />
                <span className="absolute -top-3 -right-2 bg-orange border-2 border-white text-white text-[10px] font-extrabold h-6 w-6 rounded-full flex items-center justify-center shadow-md">
                  1
                </span>
              </div>
              <div>
                <p className="text-base font-bold text-slate-800 truncate px-2">{podium.first.name}</p>
                <p className="text-xs text-muted">Level {levelFromXP(podium.first.xp)}</p>
                <div className="mt-1 flex justify-center gap-1">
                  {podium.first.badges.map((b) => renderBadge(b.badgeId))}
                </div>
              </div>
              <div className="h-36 w-full bg-gradient-to-t from-orange-100 to-orange-50 rounded-t-2xl flex flex-col justify-end p-4 border-t-2 border-x border-orange-200 shadow-sm">
                <span className="text-xs font-bold text-orange-600">Champion</span>
                <span className="text-base font-black text-orange-700">
                  {tab === "xp" ? `${podium.first.xp} XP` : `${podium.first.streak} days`}
                </span>
              </div>
            </div>
          ) : (
            <div className="h-36 w-full bg-slate-100/50 border border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-xs text-slate-400">
              Empty Slot
            </div>
          )}
        </div>

        {/* 3rd Place */}
        <div className="order-3 flex flex-col items-center">
          {podium.third ? (
            <div className="w-full text-center space-y-2">
              <div className="relative inline-block">
                <Avatar name={podium.third.name} size={64} accent="navy" />
                <span className="absolute -top-3 -right-2 bg-amber-700 border-2 border-white text-white text-[10px] font-extrabold h-6 w-6 rounded-full flex items-center justify-center shadow-sm">
                  3
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 truncate px-2">{podium.third.name}</p>
                <p className="text-xs text-muted">Level {levelFromXP(podium.third.xp)}</p>
                <div className="mt-1 flex justify-center gap-1">
                  {podium.third.badges.map((b) => renderBadge(b.badgeId))}
                </div>
              </div>
              <div className="h-24 w-full bg-gradient-to-t from-amber-100 to-amber-50 rounded-t-2xl flex flex-col justify-end p-3 border-t border-x border-amber-200/40">
                <span className="text-xs font-semibold text-amber-700">3rd Place</span>
                <span className="text-sm font-extrabold text-amber-800">
                  {tab === "xp" ? `${podium.third.xp} XP` : `${podium.third.streak} days`}
                </span>
              </div>
            </div>
          ) : (
            <div className="h-24 w-full bg-slate-100/50 border border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-xs text-slate-400">
              Empty Slot
            </div>
          )}
        </div>
      </div>

      {/* Rankings List (4th place onwards) */}
      <div className="rounded-2xl border border-line bg-surface p-5 md:p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-800 mb-4">Rankings</h2>
        <div className="divide-y divide-line">
          {remainingList.map((entry) => {
            const isSelf = entry.userId === currentUserId;
            return (
              <div
                key={entry.userId}
                className={`flex items-center justify-between gap-4 py-3.5 px-3 rounded-xl transition-colors ${
                  isSelf ? "bg-navy-50/50 border border-navy/20 font-semibold" : "hover:bg-slate-50/50"
                }`}
              >
                {/* Rank & User details */}
                <div className="flex items-center gap-4 min-w-0">
                  <span className="w-6 text-center text-sm font-extrabold text-slate-500">
                    #{entry.rank}
                  </span>
                  <Avatar name={entry.name} size={36} accent={isSelf ? "orange" : "navy"} />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">
                      {entry.name} {isSelf && <span className="text-xs text-navy font-semibold">(You)</span>}
                    </p>
                    <p className="text-xs text-muted mt-0.5">Level {levelFromXP(entry.xp)}</p>
                  </div>
                </div>

                {/* Score & Badges */}
                <div className="flex items-center gap-5 shrink-0">
                  <div className="flex items-center gap-1.5">
                    {entry.badges.map((b) => renderBadge(b.badgeId))}
                  </div>
                  <span className="text-sm font-bold text-slate-800 w-24 text-right">
                    {tab === "xp" ? `${entry.xp} XP` : `${entry.streak} days`}
                  </span>
                </div>
              </div>
            );
          })}
          {remainingList.length === 0 && (
            <p className="py-8 text-center text-sm text-muted">No other students on the leaderboard yet.</p>
          )}
        </div>
      </div>

      {/* Current User's Floating Status Bar */}
      {currentUserEntry && (
        <div className="sticky bottom-4 z-10 rounded-2xl border-2 border-navy bg-navy text-white p-4 shadow-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">🏆</span>
            <div>
              <p className="text-sm font-bold">Your Standing</p>
              <p className="text-xs text-white/70">
                You are currently ranked <span className="font-semibold text-white">#{currentUserEntry.rank}</span> on the board.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold">
                {tab === "xp" ? `${currentUserEntry.xp} XP` : `${currentUserEntry.streak} day streak`}
              </p>
              <p className="text-[10px] text-white/60">Level {levelFromXP(currentUserEntry.xp)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
