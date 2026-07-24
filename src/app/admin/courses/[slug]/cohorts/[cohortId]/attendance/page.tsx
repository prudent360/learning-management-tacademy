import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { requirePermission } from "@/lib/dal";
import { getCourse } from "@/lib/courses-server";
import { getCohortRoster, listAttendanceDates } from "@/app/actions/attendance";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { AttendanceRoster } from "@/components/AttendanceRoster";
import { ArrowLeftIcon } from "@/components/icons";

type Props = {
  params: Promise<{ slug: string; cohortId: string }>;
  searchParams: Promise<{ date?: string }>;
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default async function AdminCohortAttendancePage({ params, searchParams }: Props) {
  const admin = await requirePermission("courses:view");
  const { slug, cohortId } = await params;
  const { date } = await searchParams;
  const day = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : todayIso();

  const course = await getCourse(slug);
  if (!course) notFound();
  if (admin.category === "INSTRUCTOR" && course.instructorUserId !== admin.id) {
    redirect("/admin/courses");
  }

  const cohort = await prisma.cohort.findUnique({ where: { id: cohortId } });
  if (!cohort || cohort.courseSlug !== slug) notFound();

  const [roster, markedDates] = await Promise.all([
    getCohortRoster(cohortId, day),
    listAttendanceDates(cohortId),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Attendance — ${cohort.name}`}
        subtitle={course.title}
        action={
          <Link
            href={`/admin/courses/${slug}/cohorts`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to cohorts
          </Link>
        }
      />

      <AttendanceRoster cohortId={cohortId} date={day} roster={roster} markedDates={markedDates} />
    </div>
  );
}
