"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  gradeSubmissionAction,
  requestResubmissionAction,
  type SubmissionRow,
} from "@/app/actions/assignments";
import { Avatar } from "@/components/Avatar";
import { SubmissionStatusBadge } from "@/components/SubmissionStatusBadge";

const TYPE_LABEL: Record<string, string> = {
  FILE: "Uploaded file",
  GITHUB: "GitHub",
  PORTFOLIO: "Portfolio",
  DRIVE: "Google Drive",
  VIDEO: "Video",
};

export function GradingQueue({
  maxScore,
  rows,
}: {
  maxScore: number;
  rows: SubmissionRow[];
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <div className="grid grid-cols-1 gap-3">
        {rows.map((row) => (
          <SubmissionRowCard key={row.userId} row={row} maxScore={maxScore} />
        ))}

        {rows.length === 0 && (
          <p className="py-8 text-center text-sm text-muted">No students enrolled in this cohort yet.</p>
        )}
      </div>
    </div>
  );
}

function SubmissionRowCard({ row, maxScore }: { row: SubmissionRow; maxScore: number }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [grade, setGrade] = useState(String(row.submission?.grade ?? ""));
  const [feedback, setFeedback] = useState(row.submission?.feedback ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleGrade = () => {
    if (!row.submission) return;
    setError(null);
    const gradeNum = Number(grade);
    if (Number.isNaN(gradeNum) || gradeNum < 0) {
      setError("Enter a valid score.");
      return;
    }
    startTransition(async () => {
      const result = await gradeSubmissionAction(row.submission!.id, { grade: gradeNum, feedback });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setEditing(false);
      router.refresh();
    });
  };

  const handleRequestResubmission = () => {
    if (!row.submission) return;
    setError(null);
    startTransition(async () => {
      const result = await requestResubmissionAction(row.submission!.id, feedback);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setEditing(false);
      router.refresh();
    });
  };

  return (
    <div className="rounded-xl bg-surface-muted p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-2.5">
          <Avatar name={row.userName} accent="navy" size={36} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-bold text-slate-800">{row.userName}</p>
              {row.submission && <SubmissionStatusBadge status={row.submission.status} />}
            </div>
            <p className="truncate text-xs text-muted">{row.userEmail}</p>
            {row.submission ? (
              <div className="mt-1.5 space-y-1">
                <a
                  href={row.submission.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-orange hover:underline"
                >
                  {TYPE_LABEL[row.submission.type]} ↗
                </a>
                {row.submission.note && <p className="text-xs text-muted">"{row.submission.note}"</p>}
                {row.submission.grade != null && (
                  <p className="text-xs font-bold text-slate-700">
                    Grade: {row.submission.grade}/{maxScore}
                  </p>
                )}
                {row.submission.feedback && (
                  <p className="text-xs text-muted">Feedback: {row.submission.feedback}</p>
                )}
              </div>
            ) : (
              <p className="mt-1.5 text-xs text-muted">Not submitted yet</p>
            )}
          </div>
        </div>

        {row.submission && (
          <div className="shrink-0">
            {editing ? (
              <div className="w-full space-y-2 sm:w-64">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={maxScore}
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder={`out of ${maxScore}`}
                    className="w-24 rounded-lg border border-line bg-surface px-2 py-1.5 text-xs outline-none focus:border-navy"
                  />
                  <span className="text-xs text-muted">/ {maxScore}</span>
                </div>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={2}
                  placeholder="Feedback (optional)"
                  className="w-full rounded-lg border border-line bg-surface px-2 py-1.5 text-xs outline-none focus:border-navy"
                />
                {error && <p className="text-[11px] font-semibold text-red-600">{error}</p>}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleGrade}
                    disabled={pending}
                    className="rounded-lg bg-brand-green px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-60"
                  >
                    {pending ? "Saving…" : "Save Grade"}
                  </button>
                  <button
                    onClick={handleRequestResubmission}
                    disabled={pending}
                    className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
                  >
                    Request Resubmission
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    disabled={pending}
                    className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                {row.submission.grade != null ? "Edit Grade" : "Grade"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
