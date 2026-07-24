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
  ApplicationIcon,
  CohortIcon,
} from "@/components/icons";

export type NavItem = {
  label: string;
  href: string;
  icon: typeof DashboardIcon;
};

/** `permission` gates visibility in the admin sidebar — omit for items every admin-tier role should see. */
export type AdminNavItem = NavItem & { exact?: boolean; permission?: string };

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export type AdminNavGroup = {
  title: string;
  items: AdminNavItem[];
};

export const navGroups: NavGroup[] = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: DashboardIcon },
      { label: "My Courses", href: "/my-courses", icon: CoursesIcon },
      { label: "Membership", href: "/membership", icon: CrownIcon },
    ],
  },
  {
    title: "Learning & Practice",
    items: [
      { label: "Study Planner", href: "/study-planner", icon: TargetIcon },
      { label: "Practice Exams", href: "/aptitude", icon: AptitudeIcon },
      { label: "Performance", href: "/performance", icon: AnalyticsIcon },
    ],
  },
  {
    title: "Community & Rewards",
    items: [
      { label: "Leaderboard", href: "/leaderboard", icon: LeaderboardIcon },
      { label: "Achievements", href: "/achievements", icon: TrophyIcon },
      { label: "Our Coaches", href: "/team", icon: TeamIcon },
      { label: "Book A Coach", href: "/book-a-coach", icon: CoachIcon },
    ],
  },
  {
    title: "Support",
    items: [
      { label: "Support", href: "/contact-support", icon: SupportIcon },
    ],
  },
];

export const adminNavGroups: AdminNavGroup[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: DashboardIcon, exact: true },
      { label: "Analytics", href: "/admin/analytics", icon: AnalyticsIcon, permission: "analytics:view" },
    ],
  },
  {
    title: "Academic & Content",
    items: [
      { label: "Courses", href: "/admin/courses", icon: CoursesIcon, permission: "courses:view" },
      { label: "Categories", href: "/admin/categories", icon: TagIcon, permission: "categories:view" },
      { label: "Cohorts", href: "/admin/cohorts", icon: CohortIcon, permission: "courses:view" },
      { label: "Exams", href: "/admin/exams", icon: ClipboardIcon, permission: "exams:view" },
    ],
  },
  {
    title: "People & Admissions",
    items: [
      { label: "Users", href: "/admin/users", icon: UserIcon, permission: "users:view" },
      { label: "Applications", href: "/admin/applications", icon: ApplicationIcon, permission: "applications:view" },
      { label: "Enrollments", href: "/admin/enrollments", icon: GraduationIcon, permission: "enrollments:view" },
      { label: "Coaches", href: "/admin/coaches", icon: TeamIcon, permission: "coaches:view" },
      { label: "Coach Bookings", href: "/admin/coach-bookings", icon: CalendarIcon, permission: "coach_bookings:view" },
    ],
  },
  {
    title: "Finance & Subscriptions",
    items: [
      { label: "Payments", href: "/admin/payments", icon: CreditCardIcon, permission: "payments:view" },
      { label: "Memberships", href: "/admin/memberships", icon: CrownIcon, permission: "memberships:view" },
    ],
  },
  {
    title: "System & Settings",
    items: [
      { label: "Roles", href: "/admin/roles", icon: ShieldIcon, permission: "roles:view" },
      { label: "Settings", href: "/admin/settings", icon: SettingsIcon, permission: "settings:view" },
    ],
  },
];

export const navItems: NavItem[] = navGroups.flatMap((g) => g.items);
export const adminNavItems: AdminNavItem[] = adminNavGroups.flatMap((g) => g.items);

export const categories = [
  "Critical Thinking",
  "Spatial Reasoning",
  "Three Digit Reasoning",
  "Mechanical Reasoning",
  "Numerical Reasoning",
  "Verbal Reasoning",
];
