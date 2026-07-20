import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/dal";
import { getPracticeExam } from "@/lib/courses-server";
import { ExamEditor } from "@/components/ExamEditor";

type Props = {
  params: Promise<{ categorySlug: string }>;
};

export default async function AdminExamEditPage({ params }: Props) {
  await requirePermission("exams:view");
  const { categorySlug } = await params;

  let exam = undefined;
  if (categorySlug !== "new") {
    exam = await getPracticeExam(categorySlug);
    if (!exam) notFound();
  }

  return <ExamEditor exam={exam} />;
}
