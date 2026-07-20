import type { Category } from "@prisma/client";

const style: Record<Category, string> = {
  STUDENT: "bg-navy-50 text-navy",
  INSTRUCTOR: "bg-blue-50 text-blue-600",
  ADMIN: "bg-orange-50 text-orange-600",
  AFFILIATE: "bg-green-100 text-brand-green",
  STAFF: "bg-amber-50 text-amber-600",
};

export const CATEGORY_LABELS: Record<Category, string> = {
  STUDENT: "Student",
  INSTRUCTOR: "Instructor",
  ADMIN: "Admin",
  AFFILIATE: "Affiliate",
  STAFF: "Staff",
};

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style[category]}`}
    >
      {CATEGORY_LABELS[category]}
    </span>
  );
}
