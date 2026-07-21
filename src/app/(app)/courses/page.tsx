import { CourseCard } from "@/components/CourseCard";
import { getCourses } from "@/lib/courses-server";
import { getPaymentConfig, getStudentCurrencyContext } from "@/app/actions/settings";

export default async function CoursesCatalogPage() {
  const [courses, paymentConfig, currencyContext] = await Promise.all([
    getCourses(),
    getPaymentConfig(),
    getStudentCurrencyContext(),
  ]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-navy px-6 py-3.5">
        <h1 className="text-base font-bold text-white">Courses</h1>
      </div>

      <div className="rounded-2xl bg-surface p-5 md:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-800">Full catalog</h2>
          <p className="text-sm text-muted">
            Every course on the platform — enroll in any of them to start learning.
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

        {courses.length === 0 && (
          <p className="py-8 text-center text-sm text-muted">No courses available yet.</p>
        )}
      </div>
    </div>
  );
}
