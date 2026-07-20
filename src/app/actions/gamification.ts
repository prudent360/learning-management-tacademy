"use server";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { getTodayString } from "@/lib/date";

export type GamificationSnapshot = {
  xp: number;
  streak: number;
  badges: string[];
};

/**
 * Reads the user's gamification row, applying the daily-streak-increment
 * logic (same rules as the old client-side `ensureInit`) and auto-awarding
 * the "streak-3" badge, persisting any change before returning.
 */
export async function getGamification(): Promise<GamificationSnapshot> {
  const { userId } = await verifySession();
  const today = getTodayString();

  let row = await prisma.gamification.findUnique({ where: { userId } });
  if (!row) {
    row = await prisma.gamification.create({
      data: { userId, xp: 0, streak: 1, lastActive: today },
    });
  } else {
    let { streak, lastActive } = row;
    if (lastActive) {
      const last = new Date(lastActive + "T00:00:00");
      const now = new Date(today + "T00:00:00");
      const diff = Math.round((now.getTime() - last.getTime()) / 86400000);
      if (diff === 1) {
        streak += 1;
        lastActive = today;
      } else if (diff > 1) {
        streak = 1;
        lastActive = today;
      }
    } else {
      streak = 1;
      lastActive = today;
    }

    if (streak !== row.streak || lastActive !== row.lastActive) {
      row = await prisma.gamification.update({
        where: { userId },
        data: { streak, lastActive },
      });
    }
  }

  if (row.streak >= 3) {
    await prisma.badge.upsert({
      where: { userId_badgeId: { userId, badgeId: "streak-3" } },
      create: { userId, badgeId: "streak-3" },
      update: {},
    });
  }

  const badgeRows = await prisma.badge.findMany({ where: { userId }, select: { badgeId: true } });

  return { xp: row.xp, streak: row.streak, badges: badgeRows.map((b) => b.badgeId) };
}

export async function addXP(amount: number): Promise<void> {
  const { userId } = await verifySession();
  await prisma.gamification.upsert({
    where: { userId },
    create: { userId, xp: amount, streak: 1, lastActive: getTodayString() },
    update: { xp: { increment: amount }, lastActive: getTodayString() },
  });
}

export async function unlockBadge(badgeId: string): Promise<void> {
  const { userId } = await verifySession();
  await prisma.badge.upsert({
    where: { userId_badgeId: { userId, badgeId } },
    create: { userId, badgeId },
    update: {},
  });
}

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  name: string;
  xp: number;
  streak: number;
  badges: { badgeId: string }[];
};

export async function getLeaderboardAction(): Promise<{ xpLeaderboard: LeaderboardEntry[]; streakLeaderboard: LeaderboardEntry[] }> {
  await verifySession();

  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    select: {
      id: true,
      name: true,
      gamification: {
        select: {
          xp: true,
          streak: true,
        },
      },
      badges: {
        select: {
          badgeId: true,
        },
      },
    },
  });

  const entries = students.map((s) => ({
    userId: s.id,
    name: s.name,
    xp: s.gamification?.xp ?? 0,
    streak: s.gamification?.streak ?? 0,
    badges: s.badges,
  }));

  const xpSorted = [...entries]
    .sort((a, b) => b.xp - a.xp)
    .map((entry, idx) => ({ ...entry, rank: idx + 1 }));

  const streakSorted = [...entries]
    .sort((a, b) => b.streak - a.streak)
    .map((entry, idx) => ({ ...entry, rank: idx + 1 }));

  return {
    xpLeaderboard: xpSorted,
    streakLeaderboard: streakSorted,
  };
}

