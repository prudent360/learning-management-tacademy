"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteUserAction } from "@/app/actions/admin";
import { TrashIcon } from "@/components/icons";

export function DeleteUserButton({ userId, userName }: { userId: string; userName: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteUserAction(userId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push("/admin/users");
    });
  };

  if (confirming) {
    return (
      <div className="space-y-2">
        <p className="text-xs font-semibold text-red-700">
          {error ?? `Permanently delete ${userName}? This also removes their enrollments, payments, and certificates.`}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={handleConfirm}
            disabled={pending}
            className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Deleting…" : "Confirm delete"}
          </button>
          <button
            onClick={() => setConfirming(false)}
            disabled={pending}
            className="rounded-md border border-line px-2.5 py-1 text-xs font-semibold text-slate-600 transition-colors hover:bg-surface-muted"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100"
    >
      <TrashIcon className="h-3.5 w-3.5" />
      Delete user
    </button>
  );
}
