import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { requirePermission } from "@/lib/dal";
import { getCourse } from "@/lib/courses-server";
import { listSubmissions } from "@/app/actions/assignments";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { GradingQueue } from "@/components/GradingQueue";
import { ArrowLeftIcon } from "@/components/icons";

type Props = {
  params: Promise<{ slug: string; cohortId: string; assignmentId: string }>;
};

export default async function AdminAssignmentGradingPage({ params }: Props) {
  const admin = await requirePermission("courses:view");
  const { slug, cohortId, assignmentId } = await params;

  const course = await getCourse(slug);
  if (!course) notFound();
  if (admin.category === "INSTRUCTOR" && course.instructorUserId !== admin.id) {
    redirect("/admin/courses");
  }

  const cohort = await prisma.cohort.findUnique({ where: { id: cohortId } });
  if (!cohort || cohort.courseSlug !== slug) notFound();

  const { assignment, rows } = await listSubmissions(assignmentId);
  if (!assignment) notFound();

  const submittedCount = rows.filter((r) => r.submission).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={assignment.title}
        subtitle={`${submittedCount}/${rows.length} submitted — ${cohort.name}`}
        action={
          <Link
            href={`/admin/courses/${slug}/cohorts/${cohortId}/assignments`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to assignments
          </Link>
        }
      />

      <GradingQueue maxScore={assignment.maxScore} rows={rows} />
    </div>
  );
}
