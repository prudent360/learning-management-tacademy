import { requirePermission } from "@/lib/dal";
import { getUserPermissionKeys } from "@/lib/permissions-server";
import { getCourses } from "@/lib/courses-server";
import { listAllCohorts } from "@/app/actions/cohorts";
import { listInstructors } from "@/app/actions/admin";
import { GlobalCohortOverview } from "@/components/GlobalCohortOverview";

const STATUSES = ["UPCOMING", "ENROLLMENT_OPEN", "ONGOING", "COMPLETED", "ARCHIVED"] as const;

export default async function AdminCohortsOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const admin = await requirePermission("courses:view");
  const { status } = await searchParams;
  const statusFilter = STATUSES.includes(status as (typeof STATUSES)[number])
    ? (status as (typeof STATUSES)[number])
    : undefined;

  const [allCohorts, allCourses, instructors, permissions] = await Promise.all([
    listAllCohorts(),
    getCourses(),
    listInstructors(),
    getUserPermissionKeys(admin.id),
  ]);

  const cohorts = statusFilter ? allCohorts.filter((c) => c.status === statusFilter) : allCohorts;
  const courseList = allCourses.map((c) => ({ slug: c.slug, title: c.title }));

  return (
    <GlobalCohortOverview
      allCohorts={allCohorts}
      cohorts={cohorts}
      courses={courseList}
      instructors={instructors}
      canEdit={permissions.has("courses:edit")}
    />
  );
}
