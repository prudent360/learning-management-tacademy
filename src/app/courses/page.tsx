import { CourseCard } from "@/components/CourseCard";
import { LandingHeader } from "@/components/LandingHeader";
import { getCourses } from "@/lib/courses-server";
import { getPaymentConfig, getPublicBrandingSettings, getStudentCurrencyContext } from "@/app/actions/settings";

export default async function PublicCoursesCatalogPage() {
  const [courses, paymentConfig, currencyContext, branding] = await Promise.all([
    getCourses(),
    getPaymentConfig(),
    getStudentCurrencyContext(),
    getPublicBrandingSettings(),
  ]);

  const siteName = branding.siteName || "TekSkillUp";

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased">
      <LandingHeader headerLogo={branding.headerLogo} siteName={siteName} />

      <section className="bg-[#1A3D4B] text-white py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-8 text-center space-y-3">
          <div className="inline-block rounded-full bg-[#FF4712] px-4 py-1 text-xs font-bold text-white uppercase tracking-wider">
            Explore Programs
          </div>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl md:text-5xl">
            Certified Tech Training Programs
          </h1>
          <p className="mx-auto max-w-2xl text-xs sm:text-sm text-teal-100/90 leading-relaxed">
            Browse our comprehensive selection of industry-aligned tech programs. Click View Program to see curriculum, schedules, and register.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard
              key={course.slug}
              course={course}
              currency={paymentConfig.currency}
              displayCurrency={currencyContext.displayCurrency}
              displayRate={currencyContext.rate}
            />
          ))}
        </div>

        {courses.length === 0 && (
          <div className="rounded-2xl bg-white p-12 text-center text-sm text-slate-500 shadow-sm border border-slate-200">
            No programs published yet. Please check back soon!
          </div>
        )}
      </section>
    </div>
  );
}
