import type { Category } from "@prisma/client";

export type PermissionSection = {
  key: string;
  label: string;
  actions: readonly string[];
};

/** Every admin-panel section a permission can gate, and which CRUD-style actions apply to it. */
export const PERMISSION_SECTIONS: PermissionSection[] = [
  { key: "users", label: "Users", actions: ["view", "create", "edit", "delete"] },
  { key: "courses", label: "Courses", actions: ["view", "create", "edit", "delete"] },
  { key: "enrollments", label: "Enrollments", actions: ["view"] },
  { key: "exams", label: "Exams", actions: ["view", "create", "edit", "delete"] },
  { key: "coaches", label: "Coaches", actions: ["view", "create", "edit", "delete"] },
  { key: "coach_bookings", label: "Coach Bookings", actions: ["view", "delete"] },
  { key: "payments", label: "Payments", actions: ["view", "edit"] },
  { key: "memberships", label: "Memberships", actions: ["view", "create", "edit", "delete"] },
  { key: "analytics", label: "Analytics", actions: ["view"] },
  { key: "roles", label: "Roles & Permissions", actions: ["view", "edit"] },
  { key: "settings", label: "Settings", actions: ["view", "edit"] },
];

export function permissionKey(section: string, action: string): string {
  return `${section}:${action}`;
}

export function allPermissionKeys(): string[] {
  return PERMISSION_SECTIONS.flatMap((s) => s.actions.map((a) => permissionKey(s.key, a)));
}

/** The 5 admin-tier roles this app manages, keyed to match Category values (lowercased). */
export const ADMIN_ROLE_DEFS = [
  {
    key: "super_admin",
    name: "Super Admin",
    description: "Full, unrestricted access to every part of the admin panel.",
    isSystem: true,
  },
  {
    key: "admin",
    name: "Admin",
    description: "Broad administrative access across the platform.",
    isSystem: false,
  },
  {
    key: "manager",
    name: "Manager",
    description: "Day-to-day operations: courses, enrollments, exams, coaching, memberships.",
    isSystem: false,
  },
  {
    key: "staff",
    name: "Staff",
    description: "Support-desk access — mostly read-only visibility.",
    isSystem: false,
  },
  {
    key: "instructor",
    name: "Instructor",
    description: "Manages their own assigned courses and sees their own students.",
    isSystem: false,
  },
] as const;

export type AdminRoleKey = (typeof ADMIN_ROLE_DEFS)[number]["key"];

/** Default permission grants seeded for each role the first time the Roles page is opened. */
export const DEFAULT_ROLE_PERMISSIONS: Record<AdminRoleKey, string[]> = {
  super_admin: allPermissionKeys(),
  admin: allPermissionKeys(),
  manager: [
    "users:view",
    "courses:view",
    "courses:edit",
    "enrollments:view",
    "exams:view",
    "exams:edit",
    "coaches:view",
    "coaches:edit",
    "coach_bookings:view",
    "coach_bookings:delete",
    "payments:view",
    "payments:edit",
    "memberships:view",
    "memberships:edit",
    "analytics:view",
  ],
  staff: [
    "users:view",
    "courses:view",
    "enrollments:view",
    "exams:view",
    "coaches:view",
    "coach_bookings:view",
    "analytics:view",
  ],
  instructor: ["courses:view", "courses:edit", "enrollments:view"],
};

/** Category → AdminRole key, for the 5 admin-tier categories. Student/Affiliate have no admin role. */
export function categoryToRoleKey(category: Category): AdminRoleKey | null {
  switch (category) {
    case "SUPER_ADMIN":
      return "super_admin";
    case "ADMIN":
      return "admin";
    case "MANAGER":
      return "manager";
    case "STAFF":
      return "staff";
    case "INSTRUCTOR":
      return "instructor";
    default:
      return null;
  }
}

/**
 * Admin route prefix → the permission required to view it. Checked in
 * proxy.ts (which redirects before any rendering starts) rather than inside
 * the page components themselves — Next.js streams a page's render when it
 * has a sibling loading.tsx, and calling redirect() mid-stream from deep in
 * that render tree is unreliable in this app's Next.js version. Order
 * matters: first matching prefix wins, so list longer/more specific paths
 * first where prefixes could overlap. Bare "/admin" (the dashboard) is
 * intentionally not gated — every admin-tier role can see it.
 */
export const ADMIN_PATH_PERMISSIONS: { prefix: string; permission: string }[] = [
  { prefix: "/admin/users", permission: "users:view" },
  { prefix: "/admin/courses", permission: "courses:view" },
  { prefix: "/admin/enrollments", permission: "enrollments:view" },
  { prefix: "/admin/exams", permission: "exams:view" },
  { prefix: "/admin/coach-bookings", permission: "coach_bookings:view" },
  { prefix: "/admin/coaches", permission: "coaches:view" },
  { prefix: "/admin/payments", permission: "payments:view" },
  { prefix: "/admin/memberships", permission: "memberships:view" },
  { prefix: "/admin/analytics", permission: "analytics:view" },
  { prefix: "/admin/roles", permission: "roles:view" },
  { prefix: "/admin/settings", permission: "settings:view" },
];

/** Inverse of categoryToRoleKey — the Category value an AdminRole key corresponds to. */
export function roleKeyToCategory(key: AdminRoleKey): Category {
  const map: Record<AdminRoleKey, Category> = {
    super_admin: "SUPER_ADMIN",
    admin: "ADMIN",
    manager: "MANAGER",
    staff: "STAFF",
    instructor: "INSTRUCTOR",
  };
  return map[key];
}
