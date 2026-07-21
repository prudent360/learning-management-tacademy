import Link from "next/link";
import { CourseCard } from "@/components/CourseCard";
import { getCourses } from "@/lib/courses-server";
import { getPaymentConfig, getStudentCurrencyContext } from "@/app/actions/settings";
import { getMyEnrolledCourseSlugs } from "@/app/actions/enrollment";
import { BookIcon } from "@/components/icons";

export default async function MyCoursesPage() {
  const [allCourses, enrolledSlugs, paymentConfig, currencyContext] = await Promise.all([
    getCourses(),
    getMyEnrolledCourseSlugs(),
    getPaymentConfig(),
    getStudentCurrencyContext(),
  ]);

  const enrolledSet = new Set(enrolledSlugs);
  const courses = allCourses.filter((c) => enrolledSet.has(c.slug));

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-navy px-6 py-3.5">
        <h1 className="text-base font-bold text-white">My Courses</h1>
      </div>

      <div className="rounded-2xl bg-surface p-5 md:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-800">Continue learning</h2>
          <p className="text-sm text-muted">
            Pick up where you left off — your progress saves automatically.
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-navy-50 text-navy">
              <BookIcon className="h-7 w-7" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-800">No courses yet</p>
              <p className="mt-1 max-w-sm text-sm text-muted">
                You haven&apos;t enrolled in any courses. Browse the full catalog to get started.
              </p>
            </div>
            <Link
              href="/courses"
              className="mt-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-700"
            >
              Browse all courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
        )}
      </div>
    </div>
  );
}
