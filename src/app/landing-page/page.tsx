import type { Metadata } from "next";
import Link from "next/link";
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
  CoachIcon,
  TrophyIcon,
  GraduationIcon,
  ArrowRightIcon,
  ClipboardIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@/components/icons";

// Draft marketing site for tekskillup.com — not yet linked anywhere, kept
// out of search results until it's ready to replace/redirect from "/".
export const metadata: Metadata = {
  title: "TekSkillUp — Landing Page Draft",
  robots: { index: false, follow: false },
};

const pillars = [
  {
    icon: AptitudeIcon,
    title: "Practice that mirrors the real thing",
    description: "Timed mock tests across the exact reasoning categories employers actually use.",
  },
  {
    icon: InterviewIcon,
    title: "A repeatable interview formula",
    description: "Structure answers, stay composed under pressure, and turn interviews into offers.",
  },
  {
    icon: CoachIcon,
    title: "Real coaches, real feedback",
    description: "Book 1:1 time with people who've sat on the other side of the hiring table.",
  },
  {
    icon: GraduationIcon,
    title: "A certificate that means something",
    description: "Finish a course and get a certificate employers can verify, not just a PDF.",
  },
];

export default async function LandingPagePage() {
  const [courses, paymentSettings, coaches] = await Promise.all([
    getCourses(),
    prisma.paymentSettings.findUnique({ where: { id: 1 } }),
    listCoaches(),
  ]);

  const currency = paymentSettings?.currency || "NGN";
  const featuredCourses = courses.slice(0, 3);
  const coachCount = coaches.filter((c) => c.bookable).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 md:px-6">
          <Logo />
          <nav className="ml-8 hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a href="#pillars" className="hover:text-navy">
              Why TekSkillUp
            </a>
            <a href="#courses" className="hover:text-navy">
              Courses
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
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="inline-block rounded-full bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-orange-600">
              Career Readiness Platform
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight text-slate-800 md:text-5xl">
              Walk into your next assessment{" "}
              <span className="text-navy">already having done the reps.</span>
            </h1>
            <p className="mt-5 text-lg text-muted">
              Structured courses, timed practice exams, and 1:1 coaching — built around the reasoning
              tests, interviews, and career assessments companies actually use.
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
          {featuredCourses[0] && (
            <div className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-line bg-surface shadow-lg">
              <div className={`relative h-28 bg-gradient-to-br ${featuredCourses[0].cover} p-4`}>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  {featuredCourses[0].category}
                </span>
                <h3 className="mt-4 text-lg font-bold text-white">{featuredCourses[0].title}</h3>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-4 text-xs text-muted">
                  <span className="flex items-center gap-1.5">
                    <ClipboardIcon className="h-4 w-4" />
                    {lessonCount(featuredCourses[0])} lessons
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ClockIcon className="h-4 w-4" />
                    by {featuredCourses[0].instructor}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-extrabold text-slate-800">
                    {featuredCourses[0].price > 0
                      ? formatCurrency(featuredCourses[0].price, currency)
                      : "Free"}
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
      </section>

      {/* Pillars */}
      <section id="pillars" className="border-t border-line bg-surface-muted/50 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-extrabold text-slate-800 md:text-3xl">Why TekSkillUp</h2>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
      {featuredCourses.length > 0 && (
        <section id="courses" className="py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-extrabold text-slate-800 md:text-3xl">Popular courses</h2>
              <p className="mt-3 text-muted">Structured, instructor-led, and built around real assessment formats.</p>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredCourses.map((c) => {
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

      {/* Final CTA */}
      <section className="border-t border-line py-16 md:py-20">
        <div className="mx-auto max-w-3xl rounded-2xl bg-navy px-6 py-12 text-center md:px-12">
          <h2 className="text-2xl font-extrabold text-white md:text-3xl">Ready to start preparing?</h2>
          <p className="mt-3 text-white/70">
            Create your free account and take your first practice exam today
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
