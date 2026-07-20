import {
  GraduationIcon,
  ClipboardIcon,
  BookIcon,
  UserIcon,
  TeamIcon,
  InterviewIcon,
  RunnerIcon,
} from "@/components/icons";
import type { Module } from "@/components/ModuleCard";

export const modules: Module[] = [
  { title: "Start Here", status: "In progress", progress: 30, meta: "Set Deadline", icon: GraduationIcon },
  { title: "Application Builder", status: "In progress", progress: 50, meta: "Set Deadline", icon: ClipboardIcon },
  { title: "Aptitude Engine", status: "In progress", progress: 45, meta: "12 days to go", icon: BookIcon, courseSlug: "aptitude-engine" },
  { title: "Personality Profiler", status: "In progress", progress: 45, meta: "Set Deadline", icon: UserIcon, courseSlug: "personality-profiler" },
  { title: "Group Assessment Blueprint", status: "In progress", progress: 65, meta: "12 days to go", icon: TeamIcon },
  { title: "Interview formula", status: "In progress", progress: 65, meta: "Set Deadline", icon: InterviewIcon, courseSlug: "interview-formula" },
  { title: "Physical Aptitude Strategy", status: "In progress", progress: 65, meta: "12 days to go", icon: RunnerIcon },
];

export const completionChecklist = [
  { label: "Course Completed", done: true },
  { label: "Group Sessions", done: true },
  { label: "Practice Questions", done: true },
  { label: "1-1 Sessions", done: true },
];

export const aptitudeProgress = [
  { label: "Course", sub: "Completed", value: 100, action: "Go to course", color: "var(--green)" },
  { label: "Aptitude Training Series", sub: "", value: 40, action: "", color: "var(--orange)" },
  { label: "Aptitude Practice Exams", sub: "", value: 40, action: "", color: "var(--orange)" },
];

export const aptitudeTasks = [
  { label: "Attended group sessions", done: true },
  { label: "Booked", done: false },
  { label: "Final Exam", done: true },
];
