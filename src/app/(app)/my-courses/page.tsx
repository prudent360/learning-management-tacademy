import { CourseCard } from "@/components/CourseCard";
import { getCourses } from "@/lib/courses-server";
import { getPaymentConfig, getStudentCurrencyContext } from "@/app/actions/settings";

export default async function MyCoursesPage() {
  const [courses, paymentConfig, currencyContext] = await Promise.all([
    getCourses(),
    getPaymentConfig(),
    getStudentCurrencyContext(),
  ]);

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
      </div>
    </div>
  );
}
