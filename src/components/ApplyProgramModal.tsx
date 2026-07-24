"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitApplicationAction } from "@/app/actions/applications";

export function ApplyProgramModal({
  courseSlug,
  courseTitle,
  onClose,
}: {
  courseSlug: string;
  courseTitle: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [motivation, setMotivation] = useState("");
  const [experience, setExperience] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const result = await submitApplicationAction(courseSlug, { motivation, experience });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSubmitted(true);
      router.refresh();
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {submitted ? (
          <div className="text-center">
            <h2 className="text-lg font-bold text-[#1A3D4B]">Application received</h2>
            <p className="mt-2 text-sm text-slate-600">
              We'll review your application to {courseTitle} and let you know the outcome soon.
            </p>
            <button
              onClick={onClose}
              className="mt-5 w-full rounded-xl bg-[#1A3D4B] py-3 text-sm font-bold text-white transition-colors hover:bg-[#15313d]"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-bold text-[#1A3D4B]">Apply to {courseTitle}</h2>
            <p className="mt-1 text-sm text-slate-500">
              Tell us a little about yourself — this helps us admit the right cohort for you.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Why do you want to join this program? <span className="text-slate-400">(optional)</span>
                </label>
                <textarea
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  rows={3}
                  placeholder="Your goals, what you're hoping to achieve..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1A3D4B]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Relevant experience <span className="text-slate-400">(optional)</span>
                </label>
                <textarea
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  rows={3}
                  placeholder="Any background in this area, tools you've used..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1A3D4B]"
                />
              </div>
              {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={onClose}
                disabled={pending}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={pending}
                className="rounded-xl bg-[#FF4712] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#e03d0d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? "Submitting…" : "Submit Application"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
