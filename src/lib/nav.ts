import {
  DashboardIcon,
  AptitudeIcon,
  CoursesIcon,
  InterviewIcon,
  PersonalityIcon,
  ProgramIcon,
  TeamIcon,
  CoachIcon,
  SupportIcon,
  TrophyIcon,
  UserIcon,
  ClipboardIcon,
  SettingsIcon,
  LeaderboardIcon,
  AnalyticsIcon,
  CalendarIcon,
  CreditCardIcon,
  GraduationIcon,
  TargetIcon,
  ShieldIcon,
  CrownIcon,
  BookIcon,
  TagIcon,
} from "@/components/icons";

export type NavItem = {
  label: string;
  href: string;
  icon: typeof DashboardIcon;
};

/** `permission` gates visibility in the admin sidebar — omit for items every admin-tier role should see. */
export type AdminNavItem = NavItem & { exact?: boolean; permission?: string };

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: DashboardIcon },
  { label: "Courses", href: "/courses", icon: BookIcon },
  { label: "My Courses", href: "/my-courses", icon: CoursesIcon },
  { label: "Membership", href: "/membership", icon: CrownIcon },
  { label: "Study Planner", href: "/study-planner", icon: TargetIcon },
  { label: "Practice Exams", href: "/aptitude", icon: AptitudeIcon },
  { label: "Performance Analytics", href: "/performance", icon: AnalyticsIcon },
  { label: "Leaderboard", href: "/leaderboard", icon: LeaderboardIcon },
  { label: "Achievements", href: "/achievements", icon: TrophyIcon },
  { label: "Our Coaches", href: "/team", icon: TeamIcon },
  { label: "Book A Coach", href: "/book-a-coach", icon: CoachIcon },
  { label: "Support", href: "/contact-support", icon: SupportIcon },
];

export const adminNavItems: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: DashboardIcon, exact: true },
  { label: "Users", href: "/admin/users", icon: UserIcon, permission: "users:view" },
  { label: "Courses", href: "/admin/courses", icon: CoursesIcon, permission: "courses:view" },
  { label: "Categories", href: "/admin/categories", icon: TagIcon, permission: "categories:view" },
  {
    label: "Enrollments",
    href: "/admin/enrollments",
    icon: GraduationIcon,
    permission: "enrollments:view",
  },
  { label: "Exams", href: "/admin/exams", icon: ClipboardIcon, permission: "exams:view" },
  { label: "Coaches", href: "/admin/coaches", icon: TeamIcon, permission: "coaches:view" },
  {
    label: "Coach Bookings",
    href: "/admin/coach-bookings",
    icon: CalendarIcon,
    permission: "coach_bookings:view",
  },
  { label: "Payments", href: "/admin/payments", icon: CreditCardIcon, permission: "payments:view" },
  {
    label: "Memberships",
    href: "/admin/memberships",
    icon: CrownIcon,
    permission: "memberships:view",
  },
  { label: "Analytics", href: "/admin/analytics", icon: AnalyticsIcon, permission: "analytics:view" },
  { label: "Roles", href: "/admin/roles", icon: ShieldIcon, permission: "roles:view" },
  { label: "Settings", href: "/admin/settings", icon: SettingsIcon, permission: "settings:view" },
];

export const categories = [
  "Critical Thinking",
  "Spatial Reasoning",
  "Three Digit Reasoning",
  "Mechanical Reasoning",
  "Numerical Reasoning",
  "Verbal Reasoning",
];
