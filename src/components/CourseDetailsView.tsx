"use client";

import { useState } from "react";
import Link from "next/link";
import { LandingHeader } from "@/components/LandingHeader";
import { ApplyProgramModal } from "@/components/ApplyProgramModal";
import { formatCurrency } from "@/lib/currency";
import type { Course } from "@/lib/courses";
import type { PublicCohortSummary } from "@/app/actions/cohorts";
import type { MyApplication } from "@/app/actions/applications";

type CourseDetailsViewProps = {
  course: Course;
  currency?: string;
  headerLogo?: string | null;
  siteName?: string;
  isEnrolled?: boolean;
  isLoggedIn?: boolean;
  nextCohort?: PublicCohortSummary | null;
  myApplication?: MyApplication | null;
};

export function CourseDetailsView({
  course,
  currency = "NGN",
  headerLogo,
  siteName = "TekSkillUp",
  isEnrolled = false,
  isLoggedIn = false,
  nextCohort = null,
  myApplication = null,
}: CourseDetailsViewProps) {
  // Module accordion state: first module open by default
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({
    [course.modules[0]?.id || "m1"]: true,
  });
  const [applying, setApplying] = useState(false);

  const toggleModule = (id: string) => {
    setOpenModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalLessons = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
  const isImageCover = course.cover && (course.cover.startsWith("/") || course.cover.startsWith("http"));

  const cohortBadgeLabel = nextCohort
    ? nextCohort.status === "ONGOING"
      ? "Cohort In Progress"
      : nextCohort.enrollmentOpen
        ? "Enrollment Open"
        : "Upcoming Cohort"
    : "Self-Paced";
  const cohortStartLabel = nextCohort
    ? new Date(nextCohort.startDate).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Start anytime";
  const cohortSubLabel = nextCohort
    ? nextCohort.status === "ONGOING"
      ? "This cohort has already started"
      : nextCohort.seatsRemaining != null
        ? `${nextCohort.seatsRemaining} seat${nextCohort.seatsRemaining === 1 ? "" : "s"} remaining`
        : nextCohort.enrollmentOpen
          ? "Enrollments currently open"
          : "Enrollment opens soon"
    : "Self-paced — learn on your own schedule";

  // Cohort-bearing programs go through Apply -> Admit; self-paced programs
  // (no cohorts at all) keep the original instant register/buy flow untouched.
  type Cta = { kind: "link" | "apply" | "disabled"; label: string; href?: string };
  const cta: Cta = isEnrolled
    ? { kind: "link", href: `/courses/${course.slug}?learn=true`, label: "Go to Classroom" }
    : !nextCohort || !isLoggedIn
      ? { kind: "link", href: `/register?course=${course.slug}`, label: "Register Now" }
      : !myApplication
        ? { kind: "apply", label: "Apply Now" }
        : myApplication.status === "ADMITTED"
          ? course.price > 0
            ? { kind: "link", href: `/courses/${course.slug}?checkout=true`, label: "Complete Enrollment" }
            : { kind: "link", href: `/courses/${course.slug}?learn=true`, label: "Go to Classroom" }
          : myApplication.status === "REJECTED"
            ? { kind: "disabled", label: "Application Not Successful" }
            : myApplication.status === "WAITLISTED"
              ? { kind: "disabled", label: "You're on the Waitlist" }
              : { kind: "disabled", label: "Application Under Review" };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased selection:bg-[#FF4712]/20 selection:text-[#FF4712]">
      {/* Header Navigation */}
      <LandingHeader headerLogo={headerLogo} siteName={siteName} />

      {/* ------------------------------------------------------------- */}
      {/* HERO SECTION WITH BACKGROUND OPACITY THUMBNAIL */}
      {/* ------------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-[#1A3D4B] text-white py-16 md:py-24">
        {/* Background Image with Opacity */}
        {isImageCover && (
          <div className="absolute inset-0 z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={course.cover}
              alt={course.title}
              className="h-full w-full object-cover opacity-25 filter blur-sm"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1A3D4B]/95 via-[#1A3D4B]/90 to-[#0f2731]/95" />
          </div>
        )}

        <div className="relative z-10 mx-auto max-w-6xl px-4 md:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
            {/* Left Content */}
            <div className="space-y-6 lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#FF4712] px-4 py-1.5 text-xs font-bold text-white shadow-sm">
                <span>{course.category || "Certified Tech Program"}</span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl text-white leading-tight">
                {course.title}
              </h1>

              <p className="text-base sm:text-lg text-teal-100/90 leading-relaxed max-w-2xl">
                {course.subtitle || course.description}
              </p>

              {/* Meta Info Badges */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-teal-100">
                <div className="flex items-center gap-1.5 rounded-lg bg-white/10 backdrop-blur px-3 py-1.5 border border-white/10">
                  <svg className="h-4 w-4 text-[#FF4712]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Taught by {course.instructor || "TekSkillUp Tutors"}</span>
                </div>

                <div className="flex items-center gap-1.5 rounded-lg bg-white/10 backdrop-blur px-3 py-1.5 border border-white/10">
                  <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <rect x="4" y="3" width="16" height="18" rx="2" strokeWidth={2} />
                    <path d="M8 8h8M8 12h8M8 16h5" strokeWidth={2} />
                  </svg>
                  <span>{course.modules.length} Modules ({totalLessons} Lessons)</span>
                </div>

                <div className="flex items-center gap-1.5 rounded-lg bg-white/10 backdrop-blur px-3 py-1.5 border border-white/10">
                  <svg className="h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="12" r="9" strokeWidth={2} />
                    <path d="M12 7v5l3 3" strokeWidth={2} />
                  </svg>
                  <span>Live Classes & Self-Paced</span>
                </div>
              </div>

              {/* Price & Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-200">
                    Tuition Fee
                  </span>
                  <p className="text-3xl font-extrabold text-white">
                    {course.price > 0 ? formatCurrency(course.price, currency) : "Free"}
                  </p>
                </div>

                {cta.kind === "link" ? (
                  <Link
                    href={cta.href!}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#FF4712] px-8 py-3.5 text-base font-bold text-white shadow-lg transition-all hover:bg-[#e03d0d] active:scale-[0.98]"
                  >
                    {cta.label}
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                ) : cta.kind === "apply" ? (
                  <button
                    onClick={() => setApplying(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#FF4712] px-8 py-3.5 text-base font-bold text-white shadow-lg transition-all hover:bg-[#e03d0d] active:scale-[0.98]"
                  >
                    {cta.label}
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-8 py-3.5 text-base font-bold text-white/80">
                    {cta.label}
                  </span>
                )}
              </div>
            </div>

            {/* Right Showcase Card */}
            <div className="lg:col-span-5">
              <div className="overflow-hidden rounded-3xl border-4 border-[#FF4712] bg-[#1A3D4B] p-2 shadow-2xl">
                <div className="relative overflow-hidden rounded-2xl bg-slate-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={isImageCover ? course.cover : "/images/landing/hero-classroom.png"}
                    alt={course.title}
                    className="h-64 sm:h-72 w-full object-cover"
                  />
                  <div className="p-6 bg-[#1A3D4B] text-white space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-teal-200">
                      <span>VERIFIED CERTIFICATION</span>
                      <span className="rounded bg-emerald-500/20 text-emerald-300 px-2 py-0.5">{cohortBadgeLabel}</span>
                    </div>
                    <h4 className="text-base font-bold">{course.title}</h4>
                    <p className="text-xs text-teal-100 leading-relaxed line-clamp-2">
                      {course.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 2: NEXT COHORT & SCHEDULE HIGHLIGHTS */}
      {/* ------------------------------------------------------------- */}
      <section className="mx-auto max-w-6xl px-4 md:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#FF4712]/10 text-[#FF4712]">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={2} />
                <path d="M16 2v4M8 2v4M3 10h18" strokeWidth={2} />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {nextCohort ? "Next Cohort Starts" : "Schedule"}
              </p>
              <h4 className="text-base font-extrabold text-[#1A3D4B] mt-0.5">{cohortStartLabel}</h4>
              <p className="text-xs text-slate-500 mt-1">{cohortSubLabel}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#1A3D4B]/10 text-[#1A3D4B]">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Learning Format</p>
              <h4 className="text-base font-extrabold text-[#1A3D4B] mt-0.5">Live & Instructor-Led</h4>
              <p className="text-xs text-slate-500 mt-1">Includes recordings & project tasks</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Certification</p>
              <h4 className="text-base font-extrabold text-[#1A3D4B] mt-0.5">Industry Diploma</h4>
              <p className="text-xs text-slate-500 mt-1">Sharable digital certificate</p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* MAIN CONTENT AREA: SYLLABUS & DESCRIPTION */}
      {/* ------------------------------------------------------------- */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Left Column: Course Overview & Curriculum */}
          <div className="space-y-12 lg:col-span-8">
            {/* About Program */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-2xl font-extrabold text-[#1A3D4B]">Program Overview</h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {course.description}
              </p>
            </div>

            {/* WHAT YOU WILL COVER / SYLLABUS ACCORDION */}
            <div className="space-y-6">
              <div>
                <div className="inline-block rounded-full bg-[#FF4712] px-3.5 py-1 text-xs font-bold text-white mb-2">
                  Curriculum & Chapters
                </div>
                <h2 className="text-2xl font-extrabold text-[#1A3D4B]">What Will Be Covered</h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Explore the structured modules and lessons included in this program. Click any chapter to toggle its lesson breakdown.
                </p>
              </div>

              {course.modules && course.modules.length > 0 ? (
                <div className="space-y-4">
                  {course.modules.map((mod, idx) => {
                    const isOpen = Boolean(openModules[mod.id]);
                    return (
                      <div
                        key={mod.id}
                        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all"
                      >
                        {/* Module Header Toggle Button */}
                        <button
                          type="button"
                          onClick={() => toggleModule(mod.id)}
                          className="flex w-full items-center justify-between bg-slate-50 px-6 py-4 text-left transition-colors hover:bg-slate-100"
                        >
                          <div className="flex items-center gap-3">
                            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#1A3D4B] text-xs font-bold text-white">
                              {idx + 1}
                            </span>
                            <div>
                              <h3 className="text-base font-bold text-[#1A3D4B]">{mod.title}</h3>
                              <p className="text-xs text-slate-500">
                                {mod.lessons?.length || 0} Lessons
                              </p>
                            </div>
                          </div>

                          <div className="grid h-8 w-8 place-items-center text-slate-500">
                            <svg
                              className={`h-5 w-5 transform transition-transform duration-200 ${
                                isOpen ? "rotate-180" : ""
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>

                        {/* Lessons List inside Module */}
                        {isOpen && (
                          <div className="divide-y divide-slate-100 bg-white px-6 py-2">
                            {mod.lessons && mod.lessons.length > 0 ? (
                              mod.lessons.map((lesson, lIdx) => (
                                <div key={lesson.id} className="flex items-center justify-between py-3">
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-slate-400">
                                      {idx + 1}.{lIdx + 1}
                                    </span>
                                    <span className="text-sm font-semibold text-slate-800">
                                      {lesson.title}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span className="rounded bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                                      {lesson.type}
                                    </span>
                                    {lesson.duration > 0 && (
                                      <span className="text-xs text-slate-500">
                                        {lesson.duration}m
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="py-3 text-xs text-slate-500 italic">
                                Practical exercises and class assignments.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                  Detailed module structure will be updated soon.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Instructor & Registration Card */}
          <div className="space-y-6 lg:col-span-4">
            {/* Instructor Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                PROGRAM INSTRUCTOR
              </h3>
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-[#1A3D4B] text-white font-bold text-lg">
                  {course.instructor ? course.instructor[0] : "T"}
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#1A3D4B]">
                    {course.instructor || "TekSkillUp Expert Tutors"}
                  </h4>
                  <p className="text-xs text-slate-500">Senior Industry Professional</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Learn from dedicated industry practitioners committed to providing hands-on mentorship, code reviews, and real-world project guidance.
              </p>
            </div>

            {/* Registration Card */}
            <div className="rounded-2xl bg-[#1A3D4B] p-6 text-white shadow-xl space-y-5">
              <div>
                <span className="inline-block rounded-full bg-[#FF4712] px-3 py-0.5 text-[11px] font-bold text-white uppercase">
                  {cohortBadgeLabel}
                </span>
                <h3 className="mt-3 text-xl font-extrabold text-white">
                  {nextCohort ? `Join ${nextCohort.name}` : "Enroll Today"}
                </h3>
                <p className="mt-1 text-xs text-teal-100">
                  {nextCohort
                    ? `Starts ${cohortStartLabel} — ${cohortSubLabel.toLowerCase()}.`
                    : "Secure your spot today and jumpstart your career in tech."}
                </p>
              </div>

              <div className="border-t border-teal-800/80 pt-4">
                <span className="text-[11px] font-bold text-teal-200 uppercase">Program Fee</span>
                <p className="text-3xl font-extrabold text-white mt-0.5">
                  {course.price > 0 ? formatCurrency(course.price, currency) : "Free"}
                </p>
              </div>

              {cta.kind === "link" ? (
                <Link
                  href={cta.href!}
                  className="block w-full rounded-xl bg-[#FF4712] py-3.5 text-center text-sm font-bold text-white shadow-lg transition-colors hover:bg-[#e03d0d]"
                >
                  {cta.label}
                </Link>
              ) : cta.kind === "apply" ? (
                <button
                  onClick={() => setApplying(true)}
                  className="block w-full rounded-xl bg-[#FF4712] py-3.5 text-center text-sm font-bold text-white shadow-lg transition-colors hover:bg-[#e03d0d]"
                >
                  {cta.label}
                </button>
              ) : (
                <span className="block w-full rounded-xl bg-white/10 py-3.5 text-center text-sm font-bold text-white/80">
                  {cta.label}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {applying && (
        <ApplyProgramModal
          courseSlug={course.slug}
          courseTitle={course.title}
          onClose={() => setApplying(false)}
        />
      )}
    </div>
  );
}
