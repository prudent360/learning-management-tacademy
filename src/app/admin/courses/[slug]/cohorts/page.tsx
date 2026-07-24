import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { requirePermission } from "@/lib/dal";
import { getUserPermissionKeys } from "@/lib/permissions-server";
import { getCourse } from "@/lib/courses-server";
import { listCohorts } from "@/app/actions/cohorts";
import { listInstructors } from "@/app/actions/admin";
import { PageHeader } from "@/components/PageHeader";
import { CohortManager } from "@/components/CohortManager";
import { ArrowLeftIcon } from "@/components/icons";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function AdminCourseCohortsPage({ params }: Props) {
  const admin = await requirePermission("courses:view");
  const { slug } = await params;

  const course = await getCourse(slug);
  if (!course) notFound();

  if (admin.category === "INSTRUCTOR" && course.instructorUserId !== admin.id) {
    redirect("/admin/courses");
  }

  const [cohorts, instructors, permissions] = await Promise.all([
    listCohorts(slug),
    listInstructors(),
    getUserPermissionKeys(admin.id),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Cohorts — ${course.title}`}
        subtitle={`${cohorts.length} cohort${cohorts.length === 1 ? "" : "s"}`}
        action={
          <Link
            href={`/admin/courses/${slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to program
          </Link>
        }
      />

      <CohortManager
        courseSlug={slug}
        cohorts={cohorts}
        instructors={instructors}
        canEdit={permissions.has("courses:edit")}
      />
    </div>
  );
}
