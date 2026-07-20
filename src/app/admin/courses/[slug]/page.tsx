import { notFound, redirect } from "next/navigation";
import { requirePermission } from "@/lib/dal";
import { getCourse } from "@/lib/courses-server";
import { getOrderCurrency } from "@/app/actions/settings";
import { listInstructors } from "@/app/actions/admin";
import { getUserPermissionKeys } from "@/lib/permissions-server";
import { CourseEditor } from "@/components/CourseEditor";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function AdminCourseEditPage({ params }: Props) {
  const admin = await requirePermission("courses:view");
  const { slug } = await params;

  const permissions = await getUserPermissionKeys(admin.id);
  if (slug === "new" && !permissions.has("courses:create")) {
    redirect("/admin/courses");
  }

  let course = undefined;
  if (slug !== "new") {
    course = await getCourse(slug);
    if (!course) notFound();

    // Instructors may only open courses assigned to them.
    if (admin.category === "INSTRUCTOR" && course.instructorUserId !== admin.id) {
      redirect("/admin/courses");
    }
  }

  const [{ currency }, instructors] = await Promise.all([getOrderCurrency(), listInstructors()]);

  return (
    <CourseEditor
      course={course}
      currency={currency}
      instructors={instructors}
      canEditInstructorAssignment={admin.category !== "INSTRUCTOR"}
    />
  );
}
