import type { Metadata } from "next";
import Link from "next/link";
import { getCourses } from "@/lib/courses-server";
import { lessonCount } from "@/lib/courses";
import { prisma } from "@/lib/prisma";
import { listCoaches } from "@/app/actions/coaches";
import { listActiveMembershipPlans } from "@/app/actions/memberships";
import { formatCurrency } from "@/lib/currency";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  AptitudeIcon,
  InterviewIcon,
  PersonalityIcon,
  CoachIcon,
  TrophyIcon,
  GraduationIcon,
  ArrowRightIcon,
  ClipboardIcon,
  ClockIcon,
  CheckCircleIcon,
  CheckIcon,
  ProgramIcon,
  CrownIcon,
} from "@/components/icons";

// Draft marketing site for tekskillup.com — not yet linked anywhere, kept
// out of search results until it's ready to replace/redirect from "/".
export const metadata: Metadata = {
  title: "TekSkillUp — Landing Page Draft",
  robots: { index: false, follow: false },
};

// Broader than "pass your interview" — this is a full academy, not a
// single-purpose test-prep tool. See project memory: academy-positioning.
const pillars = [
  {
    icon: AptitudeIcon,
    title: "Practice exams",
    description:
      "Timed mock tests across numerical, verbal, mechanical, spatial, and critical reasoning categories.",
  },
  {
    icon: InterviewIcon,
    title: "Interview mastery",
    description: "A repeatable system for structuring answers and turning interviews into offers.",
  },
  {
    icon: PersonalityIcon,
    title: "Personality profiling",
    description: "Understand how workplace assessments read you, and how to present your strengths.",
  },
  {
    icon: CoachIcon,
    title: "1:1 coach sessions",
    description: "Book real time with coaches for scored, actionable feedback on your progress.",
  },
  {
    icon: TrophyIcon,
    title: "Gamified progress",
    description: "XP, streaks, levels, and badges keep you consistent, with a leaderboard to stay sharp.",
  },
  {
    icon: GraduationIcon,
    title: "Verifiable certificates",
    description: "Earn a shareable certificate on completion, with a public page employers can verify.",
  },
];

export default async function LandingPagePage() {
  const [courses, paymentSettings, coaches, plans] = await Promise.all([
    getCourses(),
    prisma.paymentSettings.findUnique({ where: { id: 1 } }),
    listCoaches(),
    listActiveMembershipPlans(),
  ]);

  const currency = paymentSettings?.currency || "NGN";
  const bookableCoaches = coaches.filter((c) => c.bookable);
  const coachCount = bookableCoaches.length;
  const totalLessons = courses.reduce((sum, c) => sum + lessonCount(c), 0);

  const categoryCounts = new Map<string, number>();
  for (const c of courses) {
    categoryCounts.set(c.category, (categoryCounts.get(c.category) ?? 0) + 1);
  }
  const programs = Array.from(categoryCounts.entries()).map(([name, count]) => ({ name, count }));

  const heroCourse = courses.find((c) => c.cover === "from-navy to-navy-700") ?? courses[0];
  const catalogCourses = courses.slice(0, 6);

  const stats = [
    { label: "Courses", value: courses.length },
    { label: "Lessons", value: `${totalLessons}+` },
    { label: "Programs", value: programs.length },
    { label: "Expert coaches", value: coachCount },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 md:px-6">
          <Logo />
          <nav className="ml-8 hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a href="#programs" className="hover:text-navy">
              Programs
            </a>
            <a href="#courses" className="hover:text-navy">
              Courses
            </a>
            <a href="#pillars" className="hover:text-navy">
              Why TekSkillUp
            </a>
            {plans.length > 0 && (
              <a href="#plans" className="hover:text-navy">
                Plans
              </a>
            )}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:text-navy"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="inline-block rounded-full bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-orange-600">
              The TekSkillUp Academy
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight text-slate-800 md:text-5xl">
              Build career-ready skills{" "}
              <span className="text-navy">with a real curriculum, not a cram sheet.</span>
            </h1>
            <p className="mt-5 text-lg text-muted">
              Structured, instructor-led courses across reasoning, interviews, and workplace readiness —
              with practice exams, 1:1 coaching, gamified progress, and certificates you can prove.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="flex items-center justify-center gap-2 rounded-lg bg-orange px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-orange-600"
              >
                Start Learning Free
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="flex items-center justify-center rounded-lg border border-line bg-surface px-6 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-surface-muted"
              >
                I already have an account
              </Link>
            </div>
          </div>

          {/* Sample course card, matching the style already used across the app */}
          {heroCourse && (
            <div className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-line bg-surface shadow-lg">
              <div className={`relative h-28 bg-gradient-to-br ${heroCourse.cover} p-4`}>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  {heroCourse.category}
                </span>
                <h3 className="mt-4 text-lg font-bold text-white">{heroCourse.title}</h3>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-4 text-xs text-muted">
                  <span className="flex items-center gap-1.5">
                    <ClipboardIcon className="h-4 w-4" />
                    {lessonCount(heroCourse)} lessons
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ClockIcon className="h-4 w-4" />
                    by {heroCourse.instructor}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-extrabold text-slate-800">
                    {heroCourse.price > 0 ? formatCurrency(heroCourse.price, currency) : "Free"}
                  </span>
                  <Link
                    href="/register"
                    className="flex items-center gap-1 text-sm font-semibold text-orange hover:underline"
                  >
                    Get started
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-line bg-surface p-4 text-center">
              <p className="text-2xl font-extrabold text-slate-800">{s.value}</p>
              <p className="mt-1 text-xs font-medium text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Programs */}
      {programs.length > 0 && (
        <section id="programs" className="border-t border-line bg-surface-muted/50 py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-extrabold text-slate-800 md:text-3xl">Explore programs</h2>
              <p className="mt-3 text-muted">
                A growing catalog organized around the skills that move careers forward.
              </p>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {programs.map((p) => (
                <a
                  key={p.name}
                  href="#courses"
                  className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4 transition-colors hover:border-navy/40"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-navy-50 text-navy">
                    <ProgramIcon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-800">{p.name}</p>
                    <p className="text-xs text-muted">
                      {p.count} course{p.count === 1 ? "" : "s"}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why TekSkillUp */}
      <section id="pillars" className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-extrabold text-slate-800 md:text-3xl">
              Everything an academy should have
            </h2>
            <p className="mt-3 text-muted">One platform, not six disconnected tools.</p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pillars.map((p) => (
              <div key={p.title} className="rounded-2xl border border-line bg-surface p-6">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-navy-50 text-navy">
                  <p.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-base font-bold text-slate-800">{p.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses */}
      {catalogCourses.length > 0 && (
        <section id="courses" className="border-t border-line bg-surface-muted/50 py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-extrabold text-slate-800 md:text-3xl">Courses to get you there</h2>
              <p className="mt-3 text-muted">Structured, instructor-led, and built around real outcomes.</p>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {catalogCourses.map((c) => {
                const isFree = c.price <= 0;
                return (
                  <div
                    key={c.slug}
                    className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-shadow hover:shadow-md"
                  >
                    <div className={`relative h-28 bg-gradient-to-br ${c.cover} p-4`}>
                      <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                        {c.category}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-base font-bold text-slate-800">{c.title}</h3>
                      <p className="mt-1 text-sm text-muted">{c.subtitle}</p>
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-muted">
                        <ClipboardIcon className="h-4 w-4" />
                        {lessonCount(c)} lessons · {c.instructor}
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm font-extrabold text-slate-800">
                          {isFree ? "Free" : formatCurrency(c.price, currency)}
                        </span>
                        <Link
                          href="/register"
                          className="flex items-center gap-1 text-sm font-semibold text-orange hover:underline"
                        >
                          Get started
                          <ArrowRightIcon className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Coaches */}
      {bookableCoaches.length > 0 && (
        <section id="coaches" className="py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-extrabold text-slate-800 md:text-3xl">
                Learn from people who've done it
              </h2>
              <p className="mt-3 text-muted">Book 1:1 time with coaches who've sat on the other side of the table.</p>
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-5">
              {bookableCoaches.map((m) => (
                <div
                  key={m.id}
                  className="w-full max-w-[15rem] flex-1 rounded-2xl border border-line bg-surface p-5 text-center sm:min-w-[15rem]"
                >
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-navy-50 text-lg font-bold text-navy">
                    {m.name
                      .split(" ")
                      .map((p) => p[0])
                      .slice(-2)
                      .join("")}
                  </div>
                  <p className="mt-3 text-sm font-bold text-slate-800">{m.name}</p>
                  <p className="text-xs font-medium text-orange">{m.role}</p>
                  <p className="mt-1 text-xs text-muted">{m.focus}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Membership plans */}
      {plans.length > 0 && (
        <section id="plans" className="border-t border-line bg-surface-muted/50 py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange">
                <CrownIcon className="h-5 w-5" />
              </span>
              <h2 className="mt-3 text-2xl font-extrabold text-slate-800 md:text-3xl">Go further with membership</h2>
              <p className="mt-3 text-muted">Discounted courses and extra perks for committed learners.</p>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => (
                <div key={plan.id} className="flex flex-col rounded-2xl border border-line bg-surface p-6">
                  <h3 className="text-base font-bold text-slate-800">{plan.name}</h3>
                  <p className="mt-2 text-2xl font-extrabold text-slate-800">
                    {formatCurrency(plan.price, currency)}
                    <span className="text-sm font-medium text-muted">/mo</span>
                  </p>
                  {plan.discountPct > 0 && (
                    <p className="mt-1 text-xs font-semibold text-orange">
                      {plan.discountPct}% off every course
                    </p>
                  )}
                  <ul className="mt-4 flex-1 space-y-2">
                    {plan.perks.map((perk: string) => (
                      <li key={perk} className="flex items-start gap-2 text-sm text-muted">
                        <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                        {perk}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/register"
                    className="mt-5 rounded-lg bg-navy px-4 py-2.5 text-center text-sm font-bold text-white transition-colors hover:bg-navy-700"
                  >
                    Get Started
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="border-t border-line py-16 md:py-20">
        <div className="mx-auto max-w-3xl rounded-2xl bg-navy px-6 py-12 text-center md:px-12">
          <h2 className="text-2xl font-extrabold text-white md:text-3xl">Ready to start learning?</h2>
          <p className="mt-3 text-white/70">
            Create your free account and take your first course today
            {coachCount > 0
              ? `, or book time with ${coachCount === 1 ? "our coach" : `one of our ${coachCount} coaches`}.`
              : "."}
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="flex items-center gap-2 rounded-lg bg-orange px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-orange-600"
            >
              Get Started Free
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/verify"
              className="flex items-center gap-2 rounded-lg border border-white/20 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
            >
              <CheckCircleIcon className="h-4 w-4" />
              Verify a certificate
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line py-12">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <div className="col-span-2 sm:col-span-1">
              <Logo />
              <p className="mt-3 text-xs text-muted">
                The academy for career-ready skills — courses, coaching, and certificates in one place.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Learn</p>
              <div className="mt-3 flex flex-col gap-2 text-sm text-muted">
                <a href="#programs" className="hover:text-navy">
                  Programs
                </a>
                <a href="#courses" className="hover:text-navy">
                  Courses
                </a>
                {plans.length > 0 && (
                  <a href="#plans" className="hover:text-navy">
                    Membership
                  </a>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Account</p>
              <div className="mt-3 flex flex-col gap-2 text-sm text-muted">
                <Link href="/login" className="hover:text-navy">
                  Log in
                </Link>
                <Link href="/register" className="hover:text-navy">
                  Register
                </Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Trust</p>
              <div className="mt-3 flex flex-col gap-2 text-sm text-muted">
                <Link href="/verify" className="hover:text-navy">
                  Verify Certificate
                </Link>
              </div>
            </div>
          </div>
          <p className="mt-10 border-t border-line pt-6 text-xs text-muted">
            © {new Date().getFullYear()} TekSkillUp. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
