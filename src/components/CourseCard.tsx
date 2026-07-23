import Link from "next/link";
import { formatCurrency } from "@/lib/currency";
import type { Course } from "@/lib/courses";

type CourseCardProps = {
  course: Course;
  currency?: string;
  displayCurrency?: string | null;
  displayRate?: number | null;
};

export function CourseCard({
  course,
  currency = "NGN",
  displayCurrency,
  displayRate,
}: CourseCardProps) {
  const totalLessons = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 1;
  const isImageCover = course.cover && (course.cover.startsWith("/") || course.cover.startsWith("http"));

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Top Dark Teal Header Banner */}
      <div className="relative flex flex-col justify-between p-6 bg-[#1A3D4B] min-h-[170px] overflow-hidden">
        {/* Optional Cover Image with Dark Opacity Overlay */}
        {isImageCover && (
          <div className="absolute inset-0 z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={course.cover}
              alt={course.title}
              className="h-full w-full object-cover opacity-25 filter blur-[1px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A3D4B] via-[#1A3D4B]/80 to-transparent" />
          </div>
        )}

        {/* Category Pill */}
        <div className="relative z-10">
          <span className="inline-block rounded-full bg-white/20 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-white">
            {course.category || "Web Development"}
          </span>
        </div>

        {/* Title */}
        <h3 className="relative z-10 mt-4 text-xl font-bold text-white leading-snug line-clamp-2">
          {course.title}
        </h3>
      </div>

      {/* Middle Body Section */}
      <div className="flex flex-1 flex-col justify-between p-6">
        <div className="space-y-4">
          {/* Meta Info Row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <rect x="4" y="3" width="16" height="18" rx="2" strokeWidth={2} />
                <path d="M8 8h8M8 12h8M8 16h5" strokeWidth={2} strokeLinecap="round" />
              </svg>
              <span>{totalLessons} lessons</span>
            </div>

            <div className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="9" strokeWidth={2} />
                <path d="M12 7v5l3 3" strokeWidth={2} strokeLinecap="round" />
              </svg>
              <span>{course.subtitle ? "Hands-on Cohort" : "24 weeks"}</span>
            </div>

            <div className="text-slate-500 font-semibold">
              by <span className="text-slate-800">{course.instructor || "TekSkillUp Tutors"}</span>
            </div>
          </div>

          {/* WHAT YOU'LL LEARN */}
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
              WHAT YOU&apos;LL LEARN
            </p>
            <div className="space-y-1.5 text-xs font-medium text-slate-700">
              {course.modules && course.modules.length > 0 ? (
                course.modules.slice(0, 2).map((m) => (
                  <div key={m.id} className="flex items-center gap-2">
                    <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="line-clamp-1">
                      {m.title} ({m.lessons?.length || 0} lessons)
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Comprehensive Industry Skills ({totalLessons} lessons)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Divider & Price Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              COURSE PRICE
            </p>
            <p className="text-2xl font-extrabold text-[#1A3D4B] mt-0.5">
              {course.price > 0 ? formatCurrency(course.price, currency) : "Free"}
            </p>
          </div>

          <Link
            href={`/courses/${course.slug}`}
            className="block w-full rounded-xl bg-[#FF4712] py-3 text-center text-sm font-bold text-white shadow-sm transition-all hover:bg-[#e03d0d] active:scale-[0.99]"
          >
            View Course
          </Link>
        </div>
      </div>
    </div>
  );
}
