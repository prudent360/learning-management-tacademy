import type { Metadata } from "next";
import Link from "next/link";
import { getCourses } from "@/lib/courses-server";
import { prisma } from "@/lib/prisma";
import { listCoaches } from "@/app/actions/coaches";
import { getPublicBrandingSettings } from "@/app/actions/settings";
import { LandingHeader } from "@/components/LandingHeader";
import { CourseCard } from "@/components/CourseCard";

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getPublicBrandingSettings();
  const siteName = branding.siteName || "TekSkillUp";
  return {
    title: `${siteName} — Unlock Your Tech Potential With Us Today`,
    robots: { index: false, follow: false },
  };
}

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

export default async function LandingPage() {
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

      {/* HERO BANNER */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#1A3D4B] via-[#15323e] to-[#0f2731] pb-20 pt-12 md:pb-28 md:pt-16 text-white">
        <div className="mx-auto max-w-5xl px-4 text-center md:px-8">
          <div className="inline-flex items-center rounded-full bg-[#FF4712] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm mb-6">
            Tech For Everyone
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-white leading-tight">
            Unlock Your Tech Potential With Us Today
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-teal-100 sm:text-lg">
            Transform Your Career and Become a Skilled Tech Professional by Enrolling with {siteName}.
          </p>
          <div className="mt-8">
            <a
              href="#courses"
              className="inline-block rounded-xl bg-[#FF4712] px-8 py-3.5 text-base font-bold text-white shadow-lg transition-all hover:bg-[#e03d0d] active:scale-[0.98]"
            >
              Explore Programs
            </a>
          </div>

          <div className="relative mx-auto mt-12 max-w-4xl">
            <div className="relative overflow-hidden rounded-3xl border-4 border-[#FF4712] bg-slate-900 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/landing/hero-classroom.png"
                alt="Students collaborating"
                className="h-[320px] sm:h-[420px] md:h-[480px] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* WHAT SETS US APART */}
      <section id="about" className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
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
                approach equips you with in-demand skills, leading to quick employment for many graduates.
              </p>
              <a
                href="#courses"
                className="inline-block rounded-lg bg-[#1A3D4B] px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#122d38]"
              >
                Learn More
              </a>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
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

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-7">
              <div className="rounded-2xl border border-teal-100/80 bg-[#f0f6f8] p-6 shadow-sm">
                <div className="text-3xl font-extrabold text-[#FF4712]">6+</div>
                <h3 className="mt-1 text-base font-bold text-[#1A3D4B]">Years of Experience</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Over the years, we&apos;ve been known for impacting students with quality tech skills education.
                </p>
              </div>

              <div className="rounded-2xl border border-teal-100/80 bg-[#f0f6f8] p-6 shadow-sm">
                <div className="text-3xl font-extrabold text-[#FF4712]">5000+</div>
                <h3 className="mt-1 text-base font-bold text-[#1A3D4B]">Trained Students</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  With over 5,000 successful graduates, we&apos;ve empowered students with the skills and knowledge.
                </p>
              </div>

              <div className="rounded-2xl border border-teal-100/80 bg-[#f0f6f8] p-6 shadow-sm">
                <div className="text-3xl font-extrabold text-[#FF4712]">20+</div>
                <h3 className="mt-1 text-base font-bold text-[#1A3D4B]">Professional Staffs</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  &quot;Our experienced, professional instructors are committed to providing top-notch, hands-on training.&quot;
                </p>
              </div>

              <div className="rounded-2xl border border-teal-100/80 bg-[#f0f6f8] p-6 shadow-sm">
                <div className="text-3xl font-extrabold text-[#FF4712]">90%</div>
                <h3 className="mt-1 text-base font-bold text-[#1A3D4B]">Employment Rate</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  90% of our graduates successfully land jobs after training, a testament to the quality of our programs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COURSES */}
      <section id="courses" className="bg-[#f0f6f8] py-16 md:py-24 border-t border-b border-teal-100/60">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="text-center space-y-3">
            <div className="inline-block rounded-full bg-[#FF4712] px-3.5 py-1 text-xs font-bold text-white">
              Available Programs
            </div>
            <h2 className="text-3xl font-extrabold text-[#1A3D4B] md:text-4xl">Certified Tech Training Programs</h2>
          </div>

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

      {/* FOOTER */}
      <footer id="contact" className="bg-[#1A3D4B] text-white py-12 border-t border-teal-900/60">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-teal-200">
            <p>© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/login" className="hover:text-white">Log In</Link>
              <Link href="/register" className="hover:text-white">Register</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
