import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getOptionalSession } from "@/lib/dal";
import { getCourses } from "@/lib/courses-server";
import { lessonCount } from "@/lib/courses";
import { prisma } from "@/lib/prisma";
import { listCoaches } from "@/app/actions/coaches";
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
  CheckCircleIcon,
  ArrowRightIcon,
  ClipboardIcon,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "TekSkillUp — Ace Your Aptitude Tests, Interviews & Career Assessments",
  description:
    "Practice exams, interview coaching, personality profiling, and 1:1 coach sessions — everything you need to pass career assessments with confidence.",
};

const features = [
  {
    icon: AptitudeIcon,
    title: "Practice Exams",
    description:
      "Timed mock tests across numerical, verbal, mechanical, spatial, and critical reasoning — the same categories employers actually use.",
  },
  {
    icon: InterviewIcon,
    title: "Interview Formula",
    description:
      "A repeatable system for structuring answers, staying composed under pressure, and turning interviews into offers.",
  },
  {
    icon: PersonalityIcon,
    title: "Personality Profiling",
    description:
      "Understand how workplace personality questionnaires assess you, and how to present your natural strengths.",
  },
  {
    icon: CoachIcon,
    title: "1:1 Coach Sessions",
    description: "Book real time with aptitude, interview, and careers coaches for scored, actionable feedback.",
  },
  {
    icon: TrophyIcon,
    title: "Gamified Progress",
    description: "XP, streaks, levels, and badges keep you consistent — with a leaderboard to keep you sharp.",
  },
  {
    icon: GraduationIcon,
    title: "Verifiable Certificates",
    description: "Earn a shareable certificate on completion, with a public verification page employers can trust.",
  },
];

const steps = [
  {
    title: "Create your account",
    description: "Sign up in under a minute — no card required to start with free courses.",
  },
  {
    title: "Practice with purpose",
    description: "Work through courses and timed practice exams built around real assessment categories.",
  },
  {
    title: "Walk in ready",
    description: "Book a coach for final prep, then walk into your assessment or interview with confidence.",
  },
];

export default async function HomePage() {
  const session = await getOptionalSession();
  if (session) {
    redirect("/dashboard");
  }

  const [courses, paymentSettings, coaches] = await Promise.all([
    getCourses(),
    prisma.paymentSettings.findUnique({ where: { id: 1 } }),
    listCoaches(),
  ]);

  const currency = paymentSettings?.currency || "NGN";
  const totalLessons = courses.reduce((sum, c) => sum + lessonCount(c), 0);
  const categories = Array.from(new Set(courses.map((c) => c.category)));
  const bookableCoaches = coaches.filter((m) => m.bookable);
  const coachCount = bookableCoaches.length;

  const stats = [
    { label: "Courses", value: courses.length },
    { label: "Lessons", value: `${totalLessons}+` },
    { label: "Exam categories", value: categories.length },
    { label: "Expert coaches", value: coachCount },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 md:px-6">
          <Logo />
          <nav className="ml-8 hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a href="#features" className="hover:text-navy">
              Features
            </a>
            <a href="#courses" className="hover:text-navy">
              Courses
            </a>
            <a href="#coaches" className="hover:text-navy">
              Coaches
            </a>
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
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-orange-600">
            Career Readiness Platform
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight text-slate-800 md:text-5xl">
            Pass your aptitude tests, interviews, and career assessments —{" "}
            <span className="text-navy">with a plan, not luck.</span>
          </h1>
          <p className="mt-5 text-lg text-muted">
            TekSkillUp combines structured courses, timed practice exams, and 1:1 coaching so you walk into every
            assessment already having done the reps.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="flex items-center gap-2 rounded-lg bg-orange px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-orange-600"
            >
              Start Learning Free
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-line bg-surface px-6 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-surface-muted"
            >
              I already have an account
            </Link>
          </div>
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

      {/* Features */}
      <section id="features" className="border-t border-line bg-surface-muted/50 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-extrabold text-slate-800 md:text-3xl">Everything you need, one platform</h2>
            <p className="mt-3 text-muted">
              Built around how career assessments actually work — not generic study material.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border border-line bg-surface p-6">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-navy-50 text-navy">
                  <f.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-base font-bold text-slate-800">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses */}
      {courses.length > 0 && (
        <section id="courses" className="py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-extrabold text-slate-800 md:text-3xl">Courses to get you there</h2>
              <p className="mt-3 text-muted">Structured, instructor-led, and built around real assessment formats.</p>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((c) => {
                const isFree = c.price <= 0;
                return (
                  <div
                    key={c.slug}
                    className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-shadow hover:shadow-md"
                  >
                    <div className={`h-24 bg-gradient-to-br ${c.cover} p-4`}>
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
      <section id="coaches" className="border-t border-line bg-surface-muted/50 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-extrabold text-slate-800 md:text-3xl">Learn from people who've done it</h2>
            <p className="mt-3 text-muted">Book 1:1 time with coaches who've sat on the other side of the table.</p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {bookableCoaches
              .map((m) => (
                <div key={m.id} className="rounded-2xl border border-line bg-surface p-5 text-center">
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

      {/* How it works */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-extrabold text-slate-800 md:text-3xl">How it works</h2>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="rounded-2xl border border-line bg-surface p-6">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-navy text-sm font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-base font-bold text-slate-800">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-line py-16 md:py-20">
        <div className="mx-auto max-w-3xl rounded-2xl bg-navy px-6 py-12 text-center md:px-12">
          <h2 className="text-2xl font-extrabold text-white md:text-3xl">Ready to start preparing?</h2>
          <p className="mt-3 text-white/70">Create your free account and take your first practice exam today.</p>
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
      <footer className="border-t border-line py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center md:flex-row md:justify-between md:px-6 md:text-left">
          <Logo />
          <div className="flex items-center gap-6 text-sm font-medium text-muted">
            <Link href="/login" className="hover:text-navy">
              Log in
            </Link>
            <Link href="/register" className="hover:text-navy">
              Register
            </Link>
            <Link href="/verify" className="hover:text-navy">
              Verify Certificate
            </Link>
          </div>
          <p className="text-xs text-muted">© {new Date().getFullYear()} TekSkillUp. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
