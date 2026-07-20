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
} from "@/components/icons";

export type NavItem = {
  label: string;
  href: string;
  icon: typeof DashboardIcon;
};

export type AdminNavItem = NavItem & { exact?: boolean };

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: DashboardIcon },
  { label: "My Courses", href: "/my-courses", icon: CoursesIcon },
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
  { label: "Users", href: "/admin/users", icon: UserIcon },
  { label: "Courses", href: "/admin/courses", icon: CoursesIcon },
  { label: "Enrollments", href: "/admin/enrollments", icon: GraduationIcon },
  { label: "Exams", href: "/admin/exams", icon: ClipboardIcon },
  { label: "Coaches", href: "/admin/coaches", icon: TeamIcon },
  { label: "Coach Bookings", href: "/admin/coach-bookings", icon: CalendarIcon },
  { label: "Payments", href: "/admin/payments", icon: CreditCardIcon },
  { label: "Analytics", href: "/admin/analytics", icon: AnalyticsIcon },
  { label: "Settings", href: "/admin/settings", icon: SettingsIcon },
];

export const categories = [
  "Critical Thinking",
  "Spatial Reasoning",
  "Three Digit Reasoning",
  "Mechanical Reasoning",
  "Numerical Reasoning",
  "Verbal Reasoning",
];
