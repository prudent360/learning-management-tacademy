import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/dal";
import { getCourse } from "@/lib/courses-server";
import { CourseEditor } from "@/components/CourseEditor";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function AdminCourseEditPage({ params }: Props) {
  await requireAdmin();
  const { slug } = await params;

  let course = undefined;
  if (slug !== "new") {
    course = await getCourse(slug);
    if (!course) notFound();
  }

  return <CourseEditor course={course} />;
}
