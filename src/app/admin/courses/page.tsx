import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { getCourses } from "@/lib/courses-server";
import { deleteCourseAction } from "@/app/actions/admin-content";
import { PageHeader } from "@/components/PageHeader";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";

export default async function AdminCoursesPage() {
  await requireAdmin();
  const courses = await getCourses();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses"
        subtitle={`${courses.length} courses`}
        action={
          <Link
            href="/admin/courses/new"
            className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-navy transition-colors hover:bg-white/90"
          >
            + Create Course
          </Link>
        }
      />

      <div className="rounded-2xl border border-line bg-surface p-6">
        <div className="grid grid-cols-1 gap-3">
          {courses.map((c) => (
            <div
              key={c.slug}
              className="flex flex-col gap-4 rounded-xl bg-surface-muted p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <span
                  className={`h-10 w-1.5 shrink-0 rounded-full bg-gradient-to-b ${c.cover}`}
                />
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold text-slate-800">{c.title}</h3>
                  <p className="mt-1 text-xs text-muted">
                    Instructor: {c.instructor} · Category: {c.category}
                  </p>
                  <p className="mt-2 truncate text-xs text-slate-500">{c.description}</p>
                  <div className="mt-3 flex items-center gap-3 text-[11px] text-muted">
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-medium">
                      {c.modules.length} Modules
                    </span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-medium">
                      {c.modules.reduce((acc, m) => acc + m.lessons.length, 0)} Lessons
                    </span>
                    <span className={`rounded px-2 py-0.5 font-bold ${c.price > 0 ? 'bg-orange/10 text-orange' : 'bg-green-100 text-green-700'}`}>
                      {c.price > 0 ? `₦${c.price.toLocaleString()}` : 'Free'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/admin/courses/${c.slug}`}
                  className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Edit
                </Link>
                <ConfirmDeleteButton
                  onDelete={deleteCourseAction.bind(null, c.slug)}
                  itemLabel={c.title}
                />
              </div>
            </div>
          ))}

          {courses.length === 0 && (
            <p className="py-8 text-center text-sm text-muted">No courses created yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
