"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@prisma/client";
import { setUserCategory } from "@/app/actions/admin";
import { CATEGORY_LABELS } from "@/components/CategoryBadge";

const CATEGORY_OPTIONS: Category[] = [
  "STUDENT",
  "AFFILIATE",
  "STAFF",
  "INSTRUCTOR",
  "MANAGER",
  "ADMIN",
  "SUPER_ADMIN",
];

export function CategorySelect({ userId, category }: { userId: string; category: Category }) {
  const router = useRouter();
  const [value, setValue] = useState(category);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleChange = (next: Category) => {
    setError(null);
    const previous = value;
    setValue(next);
    startTransition(async () => {
      const result = await setUserCategory(userId, next);
      if (!result.success) {
        setValue(previous);
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div>
      <select
        value={value}
        disabled={pending}
        onChange={(e) => handleChange(e.target.value as Category)}
        className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-navy-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {CATEGORY_OPTIONS.map((c) => (
          <option key={c} value={c}>
            {CATEGORY_LABELS[c]}
          </option>
        ))}
      </select>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
