"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type CohortRow } from "@/app/actions/cohorts";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { CohortStatusBadge } from "@/components/CohortStatusBadge";
import { CohortsOverviewFilterBar } from "@/components/CohortsOverviewFilterBar";
import { CohortFormModal } from "@/components/CohortFormModal";
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  ProgramIcon,
} from "@/components/icons";

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function GlobalCohortOverview({
  allCohorts,
  cohorts,
  courses,
  instructors,
  canEdit,
}: {
  allCohorts: CohortRow[];
  cohorts: CohortRow[];
  courses: { slug: string; title: string }[];
  instructors: { id: string; name: string }[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [showNewModal, setShowNewModal] = useState(false);

  const counts = {
    open: allCohorts.filter((c) => c.status === "ENROLLMENT_OPEN").length,
    ongoing: allCohorts.filter((c) => c.status === "ONGOING").length,
    upcoming: allCohorts.filter((c) => c.status === "UPCOMING").length,
  };

  const handleSaved = () => {
    setShowNewModal(false);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cohorts"
        subtitle={`${allCohorts.length} cohorts across all programs`}
        action={
          canEdit && courses.length > 0 ? (
            <button
              onClick={() => setShowNewModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-navy-700 shadow-sm cursor-pointer"
            >
              <PlusIcon className="h-4 w-4" />
              New Cohort
            </button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={ProgramIcon}
          label="Total Cohorts"
          value={allCohorts.length}
          accent="navy"
        />
        <StatCard
          icon={CheckCircleIcon}
          label="Enrollment Open"
          value={counts.open}
          accent="green"
        />
        <StatCard
          icon={ClockIcon}
          label="Ongoing"
          value={counts.ongoing}
          accent="amber"
        />
        <StatCard
          icon={CalendarIcon}
          label="Upcoming"
          value={counts.upcoming}
          accent="blue"
        />
      </div>

      <CohortsOverviewFilterBar />

      <div className="rounded-2xl border border-line bg-surface">
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="px-4 py-3">Program</th>
                <th className="px-4 py-3">Cohort</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3">Seats</th>
                <th className="px-4 py-3">Instructor</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cohorts.map((c) => (
                <CohortOverviewRow key={c.id} cohort={c} />
              ))}
            </tbody>
          </table>

          {cohorts.length === 0 && (
            <p className="py-8 text-center text-sm text-muted">
              No cohorts match these filters.
            </p>
          )}
        </div>

        <div className="space-y-2 p-4 sm:hidden">
          {cohorts.map((c) => (
            <div
              key={c.id}
              className="flex flex-col gap-2 rounded-xl bg-surface-muted p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-bold text-slate-800">
                  {c.name}
                </p>
                <CohortStatusBadge status={c.status} />
              </div>
              <p className="truncate text-xs text-muted">{c.courseTitle}</p>
              <p className="text-xs text-muted">
                {formatDate(c.startDate)} – {formatDate(c.endDate)}
              </p>
              <p className="text-xs text-muted">
                {c.capacity != null
                  ? `${c.enrolledCount}/${c.capacity} seats`
                  : `${c.enrolledCount} enrolled`}
                {c.instructorName ? ` · ${c.instructorName}` : ""}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <Link
                  href={`/admin/courses/${c.courseSlug}/cohorts`}
                  className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-slate-700"
                >
                  Manage
                </Link>
                <Link
                  href={`/admin/courses/${c.courseSlug}/cohorts/${c.id}/attendance`}
                  className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-slate-700"
                >
                  Attendance
                </Link>
                <Link
                  href={`/admin/courses/${c.courseSlug}/cohorts/${c.id}/assignments`}
                  className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-slate-700"
                >
                  Assignments
                </Link>
              </div>
            </div>
          ))}

          {cohorts.length === 0 && (
            <p className="py-8 text-center text-sm text-muted">
              No cohorts match these filters.
            </p>
          )}
        </div>
      </div>

      {showNewModal && (
        <CohortFormModal
          instructors={instructors}
          courses={courses}
          onClose={() => setShowNewModal(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

function CohortOverviewRow({ cohort: c }: { cohort: CohortRow }) {
  return (
    <tr className="border-b border-line last:border-0 hover:bg-surface-muted/60">
      <td className="max-w-[200px] truncate px-4 py-3 text-xs text-muted">
        {c.courseTitle}
      </td>
      <td className="px-4 py-3 text-sm font-bold text-slate-800">{c.name}</td>
      <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">
        {formatDate(c.startDate)} – {formatDate(c.endDate)}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">
        {c.capacity != null
          ? `${c.enrolledCount}/${c.capacity}`
          : `${c.enrolledCount} enrolled`}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">
        {c.instructorName ?? "—"}
      </td>
      <td className="whitespace-nowrap px-4 py-3">
        <CohortStatusBadge status={c.status} />
      </td>
      <td className="whitespace-nowrap px-4 py-3">
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/courses/${c.courseSlug}/cohorts`}
            className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Manage
          </Link>
          <Link
            href={`/admin/courses/${c.courseSlug}/cohorts/${c.id}/attendance`}
            className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Attendance
          </Link>
          <Link
            href={`/admin/courses/${c.courseSlug}/cohorts/${c.id}/assignments`}
            className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Assignments
          </Link>
        </div>
      </td>
    </tr>
  );
}
