"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { FilterPills } from "@/components/FilterPills";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "success", label: "Successful" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

export function PaymentsFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateParam("q", q);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const status = searchParams.get("status") ?? "";
  const sort = searchParams.get("sort") ?? "newest";
  const hasFilters = Boolean(searchParams.get("q") || status || (sort && sort !== "newest"));

  const clearAll = () => {
    setQ("");
    router.push(pathname);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-line bg-surface p-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by user, course, or reference…"
            className="w-full rounded-lg border border-line bg-surface py-2.5 pl-10 pr-3 text-sm outline-none focus:border-navy-600"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="rounded-lg border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-navy-600 sm:w-56"
        >
          <option value="newest">Sort by: Newest</option>
          <option value="oldest">Sort by: Oldest</option>
          <option value="amount">Sort by: Amount</option>
        </select>
      </div>

      <div className="flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
        <FilterPills
          options={STATUS_OPTIONS}
          value={status}
          onChange={(v) => updateParam("status", v)}
        />
        {hasFilters && (
          <button
            onClick={clearAll}
            className="shrink-0 self-start rounded-lg border border-line bg-surface-muted px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 sm:self-auto"
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}
