"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { FilterPills } from "@/components/FilterPills";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "UPCOMING", label: "Upcoming" },
  { value: "ENROLLMENT_OPEN", label: "Enrollment Open" },
  { value: "ONGOING", label: "Ongoing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ARCHIVED", label: "Archived" },
];

export function CohortsOverviewFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const status = searchParams.get("status") ?? "";

  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <FilterPills
        options={STATUS_OPTIONS}
        value={status}
        onChange={(v) => {
          const params = new URLSearchParams(searchParams.toString());
          if (v) params.set("status", v);
          else params.delete("status");
          router.push(`${pathname}?${params.toString()}`);
        }}
      />
    </div>
  );
}
