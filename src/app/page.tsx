import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getOptionalSession } from "@/lib/dal";
import { getCourses } from "@/lib/courses-server";
import { prisma } from "@/lib/prisma";
import { listCoaches } from "@/app/actions/coaches";
import { getPublicBrandingSettings } from "@/app/actions/settings";
import { LandingHeader } from "@/components/LandingHeader";
import { CourseCard } from "@/components/CourseCard";
import { Logo } from "@/components/Logo";

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getPublicBrandingSettings();
  const siteName = branding.siteName || "TekSkillUp";
  return {
    title: `${siteName} — Unlock Your Tech Potential With Us Today`,
    description:
      "Transform Your Career and Become a Skilled Tech Professional by Enrolling with TekSkillUp.",
  };
}

// Fallback courses matching the exact reference design cards if database has fewer courses
const MOCK_COURSES = [
  {
    slug: "product-design-ui-ux",
    title: "Product Design UI/UX",
    description:
      "Learn to design and deliver digital products that serve clients' needs and solve users' problems. Understand the fundamentals and tools of design.",
    image: "/images/landing/hero-classroom.png",
  },
  {
    slug: "full-stack-development",
    title: "Full Stack Development",
    description:
      "We teach the important skills required to jumpstart your career as a web developer. With 24 intense weeks of hands-on training.",
    image: "/images/landing/facility-classroom.png",
  },
  {
    slug: "data-science",
    title: "Data Science",
    description:
      "Learn to build predictive models, understand data visualisation and pattern recognition. You'll learn to use leading methods to wrangle large data sets.",
    image: "/images/landing/hero-classroom.png",
  },
  {
    slug: "frontend-development",
    title: "Frontend Development",
    description:
      "Master modern HTML, CSS, JavaScript, React, and responsive web design to build interactive user interfaces.",
    image: "/images/landing/facility-classroom.png",
  },
  {
    slug: "cybersecurity",
    title: "Cybersecurity",
    description:
      "Learn to defend networks, audit infrastructure security, and mitigate cyber threats with industry standard frameworks.",
    image: "/images/landing/hero-classroom.png",
  },
  {
    slug: "digital-marketing",
    title: "Digital Marketing",
    description:
      "Develop growth strategies, optimize marketing campaigns, manage social channels, and master SEO & analytics.",
    image: "/images/landing/facility-classroom.png",
  },
];

export default async function HomePage() {
  const session = await getOptionalSession();
  if (session) {
    redirect("/dashboard");
  }

  const [dbCourses, paymentSettings, coaches, branding] = await Promise.all([
    getCourses(),
    prisma.paymentSettings.findUnique({ where: { id: 1 } }),
    listCoaches(),
    getPublicBrandingSettings(),
  ]);

  const siteName = branding.siteName || "TekSkillUp";

  const displayCourses =
    dbCourses.length > 0
      ? dbCourses
      : MOCK_COURSES.map((m) => ({
          slug: m.slug,
          title: m.title,
          subtitle: m.description,
          category: "Tech Training",
          instructor: "TekSkillUp Tutors",
          cover: m.image,
          description: m.description,
          price: 0,
          modules: [
            {
              id: "m1",
              title: `Introduction to ${m.title}`,
              lessons: [
                { id: "l1", dbId: "l1", title: "Course Overview & Key Concepts", type: "video" as const, duration: 15, content: [] },
              ],
            },
          ],
        }));

  return (
    <div className="min-h-screen bg-background font-sans text-slate-800 antialiased selection:bg-[#FF4712]/20 selection:text-[#FF4712]">
      <LandingHeader headerLogo={branding.headerLogo} siteName={siteName} />

      {/* ------------------------------------------------------------- */}
      {/* SECTION 1: HERO BANNER */}
      {/* ------------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#1A3D4B] via-[#15323e] to-[#0f2731] pb-20 pt-12 md:pb-28 md:pt-16 text-white">
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#FF4712]/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 top-1/2 h-96 w-96 rounded-full bg-[#FF4712]/15 blur-3xl" />

        <div className="mx-auto max-w-5xl px-4 text-center md:px-8">
          {/* Badge */}
          <div className="inline-flex items-center rounded-full bg-[#FF4712] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm mb-6">
            Tech For Everyone
          </div>

          {/* Main Title */}
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-white leading-tight">
            Unlock Your Tech Potential With Us Today
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-5 max-w-2xl text-base text-teal-100 sm:text-lg">
            Transform Your Career and Become a Skilled Tech Professional by Enrolling with {siteName}.
          </p>

          {/* CTA */}
          <div className="mt-8">
            <a
              href="#courses"
              className="inline-block rounded-xl bg-[#FF4712] px-8 py-3.5 text-base font-bold text-white shadow-lg transition-all hover:bg-[#e03d0d] hover:shadow-xl active:scale-[0.98]"
            >
              Explore Courses
            </a>
          </div>

          {/* Hero Showcase Container & Floating Badges */}
          <div className="relative mx-auto mt-12 max-w-4xl">
            {/* Ambient Background Glow */}
            <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-[#FF4712] via-teal-500 to-[#FF4712] opacity-70 blur-md" />

            <div className="relative overflow-hidden rounded-3xl border-4 border-[#FF4712] bg-slate-900 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/landing/hero-classroom.png"
                alt="Students collaborating in modern classroom"
                className="h-[320px] sm:h-[420px] md:h-[480px] w-full object-cover"
              />

              {/* Floating Skill Badges Overlay */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

              {/* Badges Around Frame */}
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 rounded-xl bg-slate-900/80 backdrop-blur border border-white/20 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FF4712]" />
                Product Design
              </div>

              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 rounded-xl bg-slate-900/80 backdrop-blur border border-white/20 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                Data Science
              </div>

              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 flex items-center gap-2 rounded-xl bg-slate-900/80 backdrop-blur border border-white/20 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg">
                <span className="h-2.5 w-2.5 rounded-full bg-teal-400" />
                Fullstack Development
              </div>

              <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 flex items-center gap-2 rounded-xl bg-slate-900/80 backdrop-blur border border-white/20 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg">
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                Frontend Development
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 2: WHAT SETS US APART */}
      {/* ------------------------------------------------------------- */}
      <section id="about" className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          {/* Section Header */}
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-xl space-y-3">
              <div className="inline-block rounded-full bg-[#FF4712] px-3.5 py-1 text-xs font-bold text-white">
                What Sets Us Apart?
              </div>
              <h2 className="text-3xl font-extrabold text-[#1A3D4B] md:text-4xl leading-tight">
                Shaping Your Future with Industry-Leading Skills
              </h2>
            </div>
            <div className="max-w-md space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                With six years of success, {siteName} offers expert-led training by professional tutors. Our hands-on
                approach equips you with in-demand skills, leading to quick employment for many graduates. Join us for
                personalized learning and a fast track to your tech career.
              </p>
              <a
                href="#courses"
                className="inline-block rounded-lg bg-[#1A3D4B] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#122d38]"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Grid Layout: Student Portrait + 2x2 Stats Cards */}
          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            {/* Student Portrait Card */}
            <div className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-3xl border-4 border-[#FF4712] bg-[#f0f6f8] shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/landing/student-thumbsup.png"
                  alt="Student thumbs up"
                  className="h-[360px] sm:h-[420px] w-full object-cover object-center"
                />
              </div>
            </div>

            {/* 2x2 Stats Cards Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-7">
              <div className="rounded-2xl border border-teal-100/80 bg-[#f0f6f8] p-6 shadow-sm transition-transform hover:-translate-y-1">
                <div className="text-3xl font-extrabold text-[#FF4712]">6+</div>
                <h3 className="mt-1 text-base font-bold text-[#1A3D4B]">Years of Experience</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Over the years, we&apos;ve been known for impacting students with quality tech skills education.
                </p>
              </div>

              <div className="rounded-2xl border border-teal-100/80 bg-[#f0f6f8] p-6 shadow-sm transition-transform hover:-translate-y-1">
                <div className="text-3xl font-extrabold text-[#FF4712]">5000+</div>
                <h3 className="mt-1 text-base font-bold text-[#1A3D4B]">Trained Students</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  With over 5,000 successful graduates, we&apos;ve empowered students with the skills and knowledge
                  needed to excel in tech.
                </p>
              </div>

              <div className="rounded-2xl border border-teal-100/80 bg-[#f0f6f8] p-6 shadow-sm transition-transform hover:-translate-y-1">
                <div className="text-3xl font-extrabold text-[#FF4712]">20+</div>
                <h3 className="mt-1 text-base font-bold text-[#1A3D4B]">Professional Staffs</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  &quot;Our experienced, professional instructors are committed to providing top-notch, hands-on
                  training for student success.&quot;
                </p>
              </div>

              <div className="rounded-2xl border border-teal-100/80 bg-[#f0f6f8] p-6 shadow-sm transition-transform hover:-translate-y-1">
                <div className="text-3xl font-extrabold text-[#FF4712]">90%</div>
                <h3 className="mt-1 text-base font-bold text-[#1A3D4B]">Employment Rate</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  90% of our graduates successfully land jobs after training, a testament to the quality of our
                  programs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 3: CERTIFIED TECH TRAINING COURSES */}
      {/* ------------------------------------------------------------- */}
      <section id="courses" className="bg-[#f0f6f8] py-16 md:py-24 border-t border-b border-teal-100/60">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          {/* Section Heading */}
          <div className="text-center space-y-3">
            <div className="inline-block rounded-full bg-[#FF4712] px-3.5 py-1 text-xs font-bold text-white">
              Available Courses
            </div>
            <h2 className="text-3xl font-extrabold text-[#1A3D4B] md:text-4xl">Certified Tech Training Courses</h2>
            <p className="mx-auto max-w-2xl text-xs sm:text-sm text-slate-600 leading-relaxed">
              Explore our extensive selection of highly sought-after beginner-friendly tech courses, meticulously
              designed to empower and inspire learners at every step of their educational journey.
            </p>
          </div>

          {/* Course Cards Grid */}
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {displayCourses.map((course) => (
              <CourseCard
                key={course.slug}
                course={course as any}
                currency={paymentSettings?.currency || "NGN"}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 4: READY TO JOIN US? HERE'S HOW */}
      {/* ------------------------------------------------------------- */}
      <section className="bg-[#f0f6f8] pb-16 md:pb-24">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-10">
            <div className="space-y-3">
              <div className="inline-block rounded-full bg-[#FF4712] px-3.5 py-1 text-xs font-bold text-white">
                How to Enroll
              </div>
              <h2 className="text-3xl font-extrabold text-[#1A3D4B] md:text-4xl">Ready to Join Us? Here&apos;s How</h2>
            </div>
            <p className="max-w-md text-xs sm:text-sm text-slate-600 leading-relaxed">
              Getting started at {siteName} is simple: Apply, get admitted, and dive into your classes. In just three
              steps, you&apos;ll be on your way to mastering tech skills and launching a successful career.
            </p>
          </div>

          {/* Dark Navy/Teal Container */}
          <div className="rounded-3xl bg-[#1A3D4B] p-6 md:p-10 shadow-2xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
              {/* Left Photo */}
              <div className="lg:col-span-5">
                <div className="overflow-hidden rounded-2xl border-4 border-[#FF4712] shadow-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/landing/hero-classroom.png"
                    alt="Students in classroom"
                    className="h-[320px] sm:h-[380px] w-full object-cover"
                  />
                </div>
              </div>

              {/* Right Steps Stack */}
              <div className="space-y-4 lg:col-span-7">
                {/* Step 1 */}
                <div className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-md">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#FF4712] text-white">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#1A3D4B]">Apply</h3>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                      At {siteName} we offer a variety of courses designed to build your skills and professionally improve
                      you. All you have to do is apply.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-md">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#1A3D4B] text-white">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#1A3D4B]">Get Admitted</h3>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                      Once we confirm your payment for the program, we reserve your spot. Go through the onboarding
                      process before the program starts.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-md">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#27ae60] text-white">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#1A3D4B]">Start Classes</h3>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                      Be sure to attend the introductory classes, this will play a huge role in your subsequent learning
                      stages. You&apos;ll participate in projects, personal tasks and group works.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 5: OUR FACILITY */}
      {/* ------------------------------------------------------------- */}
      <section id="faq" className="bg-[#f0f6f8] pb-16 md:pb-24">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="text-center space-y-3">
            <div className="inline-block rounded-full bg-[#FF4712] px-3.5 py-1 text-xs font-bold text-white">
              What to Expect
            </div>
            <h2 className="text-3xl font-extrabold text-[#1A3D4B] md:text-4xl">Our Facility</h2>
            <p className="mx-auto max-w-2xl text-xs sm:text-sm text-slate-600 leading-relaxed">
              We have put in place a very comfortable, and conducive learning facilities where you have access to
              resources. We have also invested in unlimited internet to ensure our students don&apos;t have hindrance in
              their learning process.
            </p>
          </div>

          {/* Facility Image Frame */}
          <div className="relative mx-auto mt-10 max-w-4xl">
            <div className="relative overflow-hidden rounded-3xl border-4 border-[#1A3D4B]/30 bg-slate-900 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/landing/facility-classroom.png"
                alt="Conducive Learning Facility"
                className="h-[340px] sm:h-[440px] w-full object-cover"
              />

              {/* Floating Pill Overlay Button */}
              <div className="absolute inset-x-0 bottom-8 flex justify-center">
                <div className="rounded-full bg-white/95 backdrop-blur px-8 py-3 text-sm font-bold text-[#FF4712] shadow-xl border border-slate-100">
                  Conducive Learning Environment
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* FOOTER */}
      {/* ------------------------------------------------------------- */}
      <footer id="contact" className="bg-[#1A3D4B] text-white py-12 border-t border-teal-900/60">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <div className="col-span-2 sm:col-span-1 space-y-3">
              <Logo src={branding.footerLogo} siteName={siteName} variant="onDark" />
              <p className="text-xs text-teal-100 leading-relaxed">
                The academy for career-ready skills — courses, coaching, and certificates in one place.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-teal-200">Learn</p>
              <div className="mt-3 flex flex-col gap-2 text-sm text-teal-100">
                <a href="#courses" className="hover:text-white transition-colors">
                  Courses
                </a>
                <a href="#about" className="hover:text-white transition-colors">
                  About Us
                </a>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-teal-200">Account</p>
              <div className="mt-3 flex flex-col gap-2 text-sm text-teal-100">
                <Link href="/login" className="hover:text-white transition-colors">
                  Log In
                </Link>
                <Link href="/register" className="hover:text-white transition-colors">
                  Register
                </Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-teal-200">Trust</p>
              <div className="mt-3 flex flex-col gap-2 text-sm text-teal-100">
                <Link href="/verify" className="hover:text-white transition-colors">
                  Verify Certificate
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-teal-800/60 pt-6 text-xs text-teal-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
            <p className="text-teal-200/80">Empowering tech professionals nationwide.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
