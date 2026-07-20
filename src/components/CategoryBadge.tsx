import type { Category } from "@prisma/client";

const style: Record<Category, string> = {
  STUDENT: "bg-navy-50 text-navy",
  AFFILIATE: "bg-green-100 text-brand-green",
  STAFF: "bg-amber-50 text-amber-600",
  INSTRUCTOR: "bg-blue-50 text-blue-600",
  MANAGER: "bg-blue-100 text-blue-700",
  ADMIN: "bg-orange-50 text-orange-600",
  SUPER_ADMIN: "bg-red-50 text-red-600",
};

export const CATEGORY_LABELS: Record<Category, string> = {
  STUDENT: "Student",
  AFFILIATE: "Affiliate",
  STAFF: "Staff",
  INSTRUCTOR: "Instructor",
  MANAGER: "Manager",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super Admin",
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
