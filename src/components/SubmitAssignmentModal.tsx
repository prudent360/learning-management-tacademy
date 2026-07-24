"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  submitAssignmentAction,
  uploadAssignmentFileAction,
  type MyAssignmentRow,
  type SubmissionType,
} from "@/app/actions/assignments";

const TYPE_OPTIONS: { value: SubmissionType; label: string }[] = [
  { value: "GITHUB", label: "GitHub Link" },
  { value: "PORTFOLIO", label: "Portfolio Link" },
  { value: "DRIVE", label: "Google Drive Link" },
  { value: "VIDEO", label: "Video Link" },
  { value: "FILE", label: "Upload File" },
];

export function SubmitAssignmentModal({
  assignment,
  onClose,
  onSaved,
}: {
  assignment: MyAssignmentRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const router = useRouter();
  const [type, setType] = useState<SubmissionType>(assignment.submission?.type ?? "GITHUB");
  const [url, setUrl] = useState(assignment.submission?.type === "FILE" ? "" : assignment.submission?.url ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState(assignment.submission?.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      let finalUrl = url.trim();

      if (type === "FILE") {
        if (!file) {
          setError("Choose a file to upload.");
          return;
        }
        const formData = new FormData();
        formData.append("file", file);
        const uploadResult = await uploadAssignmentFileAction(formData);
        if (!uploadResult.success) {
          setError(uploadResult.error);
          return;
        }
        finalUrl = uploadResult.path!;
      } else if (!finalUrl) {
        setError("Paste a link to your work.");
        return;
      }

      const result = await submitAssignmentAction(assignment.id, { type, url: finalUrl, note });
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
      onSaved();
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl bg-surface p-6 shadow-xl">
        <h2 className="text-sm font-bold text-slate-800">Submit: {assignment.title}</h2>
        {assignment.submission?.status === "RESUBMISSION_REQUESTED" && assignment.submission.feedback && (
          <p className="mt-2 rounded-lg bg-red-50 p-3 text-xs text-red-700">
            <span className="font-semibold">Instructor feedback:</span> {assignment.submission.feedback}
          </p>
        )}

        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Submission type</label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value as SubmissionType);
                setFile(null);
              }}
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {type === "FILE" ? (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">File</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
              />
              <p className="mt-1 text-[11px] text-muted">PDF, DOC/DOCX, ZIP, PNG, or JPEG up to 10MB.</p>
            </div>
          ) : (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Link</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://…"
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Note <span className="text-muted">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Anything the instructor should know about your submission…"
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
            />
          </div>

          {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={pending}
            className="rounded-lg border border-line px-3.5 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-surface-muted"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={pending}
            className="rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Submitting…" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
