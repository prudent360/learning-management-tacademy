import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { requirePermission } from "@/lib/dal";
import { getUserPermissionKeys } from "@/lib/permissions-server";
import { getCourse } from "@/lib/courses-server";
import { listAssignments } from "@/app/actions/assignments";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { AssignmentsManager } from "@/components/AssignmentsManager";
import { ArrowLeftIcon } from "@/components/icons";

type Props = {
  params: Promise<{ slug: string; cohortId: string }>;
};

export default async function AdminCohortAssignmentsPage({ params }: Props) {
  const admin = await requirePermission("courses:view");
  const { slug, cohortId } = await params;

  const course = await getCourse(slug);
  if (!course) notFound();
  if (admin.category === "INSTRUCTOR" && course.instructorUserId !== admin.id) {
    redirect("/admin/courses");
  }

  const cohort = await prisma.cohort.findUnique({ where: { id: cohortId } });
  if (!cohort || cohort.courseSlug !== slug) notFound();

  const [assignments, permissions] = await Promise.all([
    listAssignments(cohortId),
    getUserPermissionKeys(admin.id),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Assignments — ${cohort.name}`}
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

      <AssignmentsManager
        courseSlug={slug}
        cohortId={cohortId}
        assignments={assignments}
        canEdit={permissions.has("courses:edit")}
      />
    </div>
  );
}
