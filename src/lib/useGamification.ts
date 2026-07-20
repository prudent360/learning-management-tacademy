"use client";

import { useSyncExternalStore } from "react";
import { emitToast } from "@/lib/toast";
import { XP_PER_LEVEL, levelFromXP, BADGES, type Badge } from "@/lib/gamification";
import {
  getGamification,
  addXP as addXPAction,
  unlockBadge as unlockBadgeAction,
} from "@/app/actions/gamification";

// Re-exported for existing client call-sites (DashboardView, AchievementsView,
// CoursePlayer). Server Components must import BADGES from "@/lib/gamification"
// directly — re-exporting a plain constant through a "use client" module still
// routes it through the RSC client-reference boundary, which breaks on the server.
export { BADGES };
export type { Badge };

type Snapshot = {
  xp: number;
  streak: number;
  badges: string[];
  ready: boolean;
};

// ---- Shared module store (single source of truth for all components) ----

const initialSnapshot: Snapshot = { xp: 0, streak: 0, badges: [], ready: false };

let snapshot: Snapshot = initialSnapshot;
let initialized = false;
const listeners = new Set<() => void>();

function commit(next: Snapshot) {
  snapshot = next;
  listeners.forEach((l) => l());
}

/** Fetches persisted state from the server. Runs once per session. */
function ensureInit() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  getGamification()
    .then(({ xp, streak, badges }) => commit({ xp, streak, badges, ready: true }))
    .catch((err) => {
      console.error("Failed to load gamification state", err);
      commit({ xp: 0, streak: 0, badges: [], ready: true });
    });
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  ensureInit();
  return () => {
    listeners.delete(cb);
  };
}

const getSnapshot = () => snapshot;
const getServerSnapshot = () => initialSnapshot;

export function addXP(amount: number) {
  ensureInit();
  const prev = snapshot.xp;
  emitToast({ kind: "xp", title: `+${amount} XP`, message: "Keep it up!" });
  if (levelFromXP(prev + amount) > levelFromXP(prev)) {
    emitToast({
      kind: "level",
      title: "Level Up!",
      message: `You reached Level ${levelFromXP(prev + amount)}`,
      durationMs: 5000,
    });
  }
  commit({ ...snapshot, xp: prev + amount, ready: true });

  addXPAction(amount).catch((err) => {
    console.error("Failed to persist XP gain", err);
  });
}

export function unlockBadge(badgeId: string) {
  ensureInit();
  if (snapshot.badges.includes(badgeId)) return;
  const badge = BADGES.find((b) => b.id === badgeId);
  emitToast({
    kind: "badge",
    title: "Badge Unlocked!",
    message: badge?.title ?? "New badge",
    emoji: badge?.icon,
    durationMs: 5000,
  });
  commit({ ...snapshot, badges: [...snapshot.badges, badgeId] });

  unlockBadgeAction(badgeId).catch((err) => {
    console.error(`Failed to persist badge unlock for ${badgeId}`, err);
  });
}

export function useGamification() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const level = levelFromXP(snap.xp);
  const nextLevelXP = level * XP_PER_LEVEL;
  const prevLevelXP = (level - 1) * XP_PER_LEVEL;
  const levelProgress = ((snap.xp - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100;

  return {
    xp: snap.xp,
    streak: snap.streak,
    badges: snap.badges,
    level,
    levelProgress,
    xpToNextLevel: nextLevelXP - snap.xp,
    ready: snap.ready,
    addXP,
    unlockBadge,
  };
}
