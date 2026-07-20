import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { getPracticeExams } from "@/lib/courses-server";
import { deletePracticeExamAction } from "@/app/actions/admin-content";
import { PageHeader } from "@/components/PageHeader";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";

export default async function AdminExamsPage() {
  await requireAdmin();
  const examsMap = await getPracticeExams();
  const exams = Object.values(examsMap);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exams"
        subtitle={`${exams.length} practice exams`}
        action={
          <Link
            href="/admin/exams/new"
            className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-navy transition-colors hover:bg-white/90"
          >
            + Create Exam
          </Link>
        }
      />

      <div className="rounded-2xl border border-line bg-surface p-6">
        <div className="grid grid-cols-1 gap-3">
          {exams.map((e) => (
            <div
              key={e.categorySlug}
              className="flex flex-col gap-4 rounded-xl bg-surface-muted p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-bold text-slate-800">{e.categoryName}</h3>
                <p className="mt-1 text-xs text-muted">
                  Slug: {e.categorySlug} · Duration: {e.durationMinutes} minutes
                </p>
                <div className="mt-3 flex items-center gap-3 text-[11px] text-muted">
                  <span className="rounded bg-slate-100 px-2 py-0.5 font-medium">
                    {e.questions.length} Questions
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/admin/exams/${e.categorySlug}`}
                  className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Edit
                </Link>
                <ConfirmDeleteButton
                  onDelete={deletePracticeExamAction.bind(null, e.categorySlug)}
                  itemLabel={e.categoryName}
                />
              </div>
            </div>
          ))}

          {exams.length === 0 && (
            <p className="py-8 text-center text-sm text-muted">No practice exams created yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
