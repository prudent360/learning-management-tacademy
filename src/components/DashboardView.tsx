"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { ProgressRing } from "@/components/ProgressRing";
import {
  TrophyIcon,
  CheckIcon,
  BookIcon,
  ClipboardIcon,
  ClockIcon,
  ArrowRightIcon,
  PlayIcon,
} from "@/components/icons";
import { lessonCount, courseMinutes } from "@/lib/courses";
import type { Course } from "@/lib/courses";
import { useProgress } from "@/lib/useProgress";
import { useGamification, BADGES } from "@/lib/useGamification";
import { useCurrentUser } from "@/lib/user-context";
import { TargetIcon } from "@/components/icons";
import type { StudyPlanItem } from "@/app/actions/goals";

export function DashboardView({
  courses,
  studyPlan,
}: {
  courses: Course[];
  studyPlan: StudyPlanItem[];
}) {
  const gamification = useGamification();
  const user = useCurrentUser();
  const firstName = user.name.split(" ")[0];

  // Load progress for all active courses
  const aptitude = useProgress("aptitude-engine");
  const interview = useProgress("interview-formula");
  const personality = useProgress("personality-profiler");

  const progressBySlug = useMemo(() => ({
    "aptitude-engine": aptitude,
    "interview-formula": interview,
    "personality-profiler": personality,
  }), [aptitude, interview, personality]);

  const getCourseProgressPct = (slug: string) => {
    const course = courses.find((c) => c.slug === slug);
    const progress = progressBySlug[slug as keyof typeof progressBySlug];
    if (!course || !progress?.ready) return 0;
    const total = lessonCount(course);
    return total ? Math.round((progress.count / total) * 100) : 0;
  };

  // Calculate overall program completion metrics
  const totals = useMemo(() => {
    let total = 0;
    let done = 0;
    courses.forEach((c) => {
      total += lessonCount(c);
      const pr = progressBySlug[c.slug as keyof typeof progressBySlug];
      if (pr?.ready) {
        done += pr.count;
      }
    });
    return { total, done };
  }, [courses, progressBySlug]);

  const journeyProgress = totals.total ? Math.round((totals.done / totals.total) * 100) : 0;
  const isAllReady = Object.values(progressBySlug).every((p) => p.ready);

  // Sync course completion badges
  useEffect(() => {
    if (!isAllReady || !gamification.ready) return;

    const hasCompletedCourse = courses.some((c) => getCourseProgressPct(c.slug) === 100);
    if (hasCompletedCourse && !gamification.badges.includes("course-master")) {
      gamification.unlockBadge("course-master");
    }

    if (totals.done > 0 && !gamification.badges.includes("first-step")) {
      gamification.unlockBadge("first-step");
    }
  }, [isAllReady, gamification.ready, gamification.badges, totals.done, courses]);

  // Find the last course student was active on to show "Resume" widget
  const resumeCourse = useMemo(() => {
    const active = courses.find((c) => {
      const pct = getCourseProgressPct(c.slug);
      return pct > 0 && pct < 100;
    });
    return active || courses[0];
  }, [courses, progressBySlug]);

  const resumePct = resumeCourse ? getCourseProgressPct(resumeCourse.slug) : 0;

  const activeGoals = studyPlan.filter((g) => g.status !== "completed" && g.targetDate);
  const behindGoals = activeGoals.filter((g) => g.status === "behind").length;
  const nextDeadline = [...activeGoals].sort(
    (a, b) => (a.daysRemaining ?? Infinity) - (b.daysRemaining ?? Infinity),
  )[0];

  // Milestones tracking
  const milestones = [
    { label: "Account created successfully", done: true },
    { label: "Started first learning track", done: totals.done > 0 },
    { label: "Completed a course module", done: totals.done >= 3 },
    { label: "Graduated program", done: journeyProgress === 100 },
  ];

  return (
    <div className="space-y-6">
      {/* Premium Greeting & Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-line bg-gradient-to-r from-navy to-navy-700 p-6 md:p-8 text-white shadow-sm">
        <div className="absolute right-0 top-0 -mr-6 -mt-6 h-36 w-36 rounded-full bg-white/5 blur-2xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wider text-orange-200">
              LEARNING DASHBOARD
            </span>
            <h1 className="text-2xl font-bold md:text-3xl">
              Welcome back, {firstName}! 👋
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Track your learning milestones, access mock tests, and keep up with your weekly achievements as you secure your dream career.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 border-l border-white/10 pl-0 md:pl-6">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/10 text-orange font-bold text-lg">
                🔥
              </span>
              <div>
                <p className="text-xs font-medium text-slate-300">Study Streak</p>
                <p className="text-base font-bold text-white">
                  {gamification.ready ? gamification.streak : 0} Days
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/10 text-yellow-400 font-bold text-lg">
                ⭐
              </span>
              <div>
                <p className="text-xs font-medium text-slate-300">Total XP</p>
                <p className="text-base font-bold text-white">
                  {gamification.ready ? gamification.xp : 0} XP
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Learning Progress & Tracks */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Resume Learning Widget */}
          {resumeCourse && (
            <div className="rounded-xl border border-line bg-surface p-5 transition-shadow hover:shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange animate-ping" />
                    <span className="text-xs font-bold text-orange uppercase tracking-wide">
                      Resume Learning
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-800">
                    {resumeCourse.title}
                  </h3>
                  <p className="text-xs text-muted">
                    {resumeCourse.subtitle}
                  </p>
                  
                  {/* Progress bar */}
                  <div className="mt-3 flex items-center gap-3 max-w-md">
                    <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-navy rounded-full transition-all"
                        style={{ width: `${resumePct}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-navy whitespace-nowrap">
                      {resumePct}% Completed
                    </span>
                  </div>
                </div>

                <Link
                  href={`/courses/${resumeCourse.slug}`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-navy hover:bg-navy-700 text-white px-5 py-2.5 text-sm font-semibold transition-colors shrink-0"
                >
                  <PlayIcon className="h-4 w-4" />
                  Continue Course
                </Link>
              </div>
            </div>
          )}

          {/* Real Learning Tracks Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800">
                Your Learning Path
              </h2>
              <Link
                href="/my-courses"
                className="text-xs font-bold text-navy hover:underline flex items-center gap-1"
              >
                View all courses <ArrowRightIcon className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.slice(0, 4).map((c) => {
                const pct = getCourseProgressPct(c.slug);
                const isStarted = pct > 0;
                
                return (
                  <div
                    key={c.slug}
                    className="flex flex-col rounded-xl border border-line bg-surface p-4 transition-all hover:shadow-md"
                  >
                    <div className={`h-12 w-full rounded-lg bg-gradient-to-br ${c.cover} mb-3 flex items-center px-3 justify-between`}>
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded backdrop-blur">
                        {c.category}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-800 truncate">
                      {c.title}
                    </h3>
                    <p className="text-xs text-muted truncate mt-0.5">
                      {c.instructor}
                    </p>

                    {/* Meta information */}
                    <div className="mt-3 flex items-center justify-between text-[11px] text-muted border-t border-line/60 pt-3">
                      <span>{lessonCount(c)} Lessons</span>
                      <span>{courseMinutes(c)} Mins</span>
                    </div>

                    {/* Progress slider */}
                    <div className="mt-4">
                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-navy rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[10px] font-bold text-navy">
                        <span>{isStarted ? "In Progress" : "Not Started"}</span>
                        <span>{pct}%</span>
                      </div>
                    </div>

                    <Link
                      href={`/courses/${c.slug}`}
                      className={`mt-4 w-full text-center py-2 rounded-lg text-xs font-bold border transition-all ${
                        isStarted
                          ? "border-navy text-navy hover:bg-navy-50"
                          : "border-line bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {pct === 100 ? "Review Track" : isStarted ? "Resume Learning" : "Start Track"}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar Stats, Achievements & Practice Exams */}
        <div className="space-y-6">
          
          {/* Practice Exam Center CTA */}
          <div className="rounded-xl border border-line bg-surface-muted/30 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-navy/5 text-navy">
                <ClipboardIcon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Practice Exam Hub
                </h3>
                <p className="text-xs text-muted">
                  Simulate real career entrance exams
                </p>
              </div>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              Test your proficiency in Critical Thinking, Mechanical Reasoning, Verbal, and Numerical skills under realistic exam timers.
            </p>

            <Link
              href="/aptitude"
              className="block w-full text-center py-2.5 rounded-lg bg-orange hover:bg-orange/95 text-white text-xs font-bold transition-all shadow-sm"
            >
              Launch Practice Exam Center
            </Link>
          </div>

          {/* Study Goals Widget */}
          <div className="rounded-xl border border-line bg-surface p-5 space-y-3">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-navy/5 text-navy">
                <TargetIcon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Study Goals</h3>
                <p className="text-xs text-muted">Target dates for your courses</p>
              </div>
            </div>

            {studyPlan.length === 0 ? (
              <p className="text-xs text-muted">Enroll in a course to start setting goals.</p>
            ) : nextDeadline ? (
              <div className="rounded-lg bg-surface-muted/50 px-3 py-2.5">
                <p className="text-xs font-semibold text-slate-700 truncate">
                  {nextDeadline.courseTitle}
                </p>
                <p
                  className={`text-xs mt-0.5 font-bold ${
                    nextDeadline.status === "behind" ? "text-orange-600" : "text-navy"
                  }`}
                >
                  {nextDeadline.daysRemaining !== null && nextDeadline.daysRemaining >= 0
                    ? `${nextDeadline.daysRemaining} days left`
                    : `${-(nextDeadline.daysRemaining ?? 0)} days overdue`}
                </p>
                {behindGoals > 0 && (
                  <p className="mt-1 text-[11px] text-orange-600">
                    {behindGoals} course{behindGoals > 1 ? "s" : ""} behind schedule
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted">No target dates set yet.</p>
            )}

            <Link
              href="/study-planner"
              className="block w-full text-center py-2 rounded-lg border border-line text-xs font-bold text-navy hover:bg-navy-50 transition-colors"
            >
              Manage Study Planner
            </Link>
          </div>

          {/* Gamification Level Widget */}
          {gamification.ready && (
            <div className="rounded-xl border border-line bg-surface p-5 space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Level Metrics
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-slate-800">
                    Level {gamification.level}
                  </span>
                  <span className="text-xs text-muted">
                    ({gamification.xp} Total XP)
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Level Progress</span>
                  <span>
                    {gamification.xpToNextLevel} XP to Level {gamification.level + 1}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-orange transition-all duration-500"
                    style={{ width: `${gamification.levelProgress}%` }}
                  />
                </div>
              </div>

              {/* Badges preview */}
              <div className="border-t border-line/60 pt-3">
                <p className="text-xs font-semibold text-slate-600 mb-2">
                  Unlocked Achievements
                </p>
                <div className="flex flex-wrap gap-2">
                  {BADGES.map((badge) => {
                    const unlocked = gamification.badges.includes(badge.id);
                    return (
                      <span
                        key={badge.id}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs border font-medium ${
                          unlocked
                            ? "bg-white border-orange-200 text-slate-800 shadow-sm"
                            : "bg-slate-50/50 border-line text-slate-400 opacity-40"
                        }`}
                        title={badge.title}
                      >
                        <span>{badge.icon}</span>
                        <span>{badge.title}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Milestones Card */}
          <div className="rounded-xl border border-line bg-surface p-5 space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Your Milestones
            </h3>
            <div className="space-y-2.5">
              {milestones.map((m) => (
                <div
                  key={m.label}
                  className="flex items-center gap-3 text-xs text-slate-700"
                >
                  <span
                    className={`grid h-5 w-5 place-items-center rounded-full text-white shrink-0 ${
                      m.done ? "bg-brand-green" : "bg-slate-100 text-slate-300"
                    }`}
                  >
                    <CheckIcon className="h-3 w-3" />
                  </span>
                  <span className={m.done ? "line-through text-slate-400" : ""}>
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
