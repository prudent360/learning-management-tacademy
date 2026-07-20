"use client";

import React from "react";
import type { AnalyticsDashboardData } from "@/app/actions/analytics";
import {
  UserIcon,
  CoursesIcon,
  ClipboardIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@/components/icons";

type AdminAnalyticsViewProps = {
  data: AnalyticsDashboardData;
};

export function AdminAnalyticsView({ data }: AdminAnalyticsViewProps) {
  
  // CSV Export for Exam Attempts
  const exportAttemptsCSV = () => {
    const headers = ["Student Name", "Student Email", "Exam Category", "Score (%)", "Time Spent (min)", "Date Completed"];
    const rows = data.recentAttempts.map((a) => [
      a.user.name,
      a.user.email,
      a.examSlug,
      a.scorePercent,
      Math.round(a.timeSpentSeconds / 60),
      new Date(a.completedAt).toLocaleString("en-US"),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.map(val => `"${val}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `exam_attempts_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Export for Course Completion Stats
  const exportCoursesCSV = () => {
    const headers = ["Course Title", "Total Lessons", "Active Students Enrolled", "Average Completion Rate (%)"];
    const rows = data.courseStats.map((c) => [
      c.title,
      c.totalLessons,
      c.studentsEnrolled,
      c.averageCompletion,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.map(val => `"${val}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `course_completion_metrics_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard icon={UserIcon} label="Total Students" value={data.totalStudents} accent="navy" />
        <MetricCard icon={CoursesIcon} label="Active Enrollments" value={data.totalEnrollments} accent="blue" />
        <MetricCard icon={CheckCircleIcon} label="Avg Course Completion" value={`${data.overallCompletionRate}%`} accent="green" />
        <MetricCard icon={ClipboardIcon} label="Total Exam Attempts" value={data.totalAttempts} accent="amber" />
        <MetricCard icon={CheckCircleIcon} label="Overall Pass Rate" value={`${data.overallPassRate}%`} accent="emerald" />
        <MetricCard icon={ClockIcon} label="Average Exam Score" value={`${data.averageScore}%`} accent="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Progress Chart/Bars */}
        <div className="rounded-2xl border border-line bg-surface p-5 md:p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-line">
            Course Completion Metrics
          </h3>
          <div className="space-y-4.5 pt-2">
            {data.courseStats.map((course) => (
              <div key={course.slug} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="truncate max-w-[70%]">{course.title}</span>
                  <span className="text-slate-500 shrink-0">
                    {course.studentsEnrolled} {course.studentsEnrolled === 1 ? "student" : "students"} started
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-navy transition-all duration-500"
                      style={{ width: `${course.averageCompletion}%` }}
                    />
                  </div>
                  <span className="text-xs font-extrabold text-slate-800 min-w-8 text-right">
                    {course.averageCompletion}%
                  </span>
                </div>
              </div>
            ))}
            {data.courseStats.length === 0 && (
              <p className="text-xs text-muted text-center py-8">No course data available.</p>
            )}
          </div>
        </div>

        {/* Practice Exam Categories Summary */}
        <div className="rounded-2xl border border-line bg-surface p-5 md:p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-line">
            Practice Exam Performance
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-line text-[10px] uppercase font-bold text-slate-400">
                  <th className="py-2.5 pb-2">Category</th>
                  <th className="py-2.5 pb-2 text-center">Attempts</th>
                  <th className="py-2.5 pb-2 text-center">Avg Score</th>
                  <th className="py-2.5 pb-2 text-right">Pass Rate (≥80%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.categoryStats.map((ex) => (
                  <tr key={ex.slug} className="text-slate-700 font-medium hover:bg-slate-50/50">
                    <td className="py-3 font-bold text-slate-800">{ex.name}</td>
                    <td className="py-3 text-center">{ex.attemptsCount}</td>
                    <td className="py-3 text-center">{ex.averageScore}%</td>
                    <td className="py-3 text-right">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded font-bold ${
                          ex.passRate >= 70
                            ? "bg-green-50 text-brand-green border border-green-200/40"
                            : "bg-orange-50 text-orange-600 border border-orange-200/40"
                        }`}
                      >
                        {ex.passRate}%
                      </span>
                    </td>
                  </tr>
                ))}
                {data.categoryStats.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-muted">
                      No exam performance data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Attempts Feed */}
        <div className="lg:col-span-2 rounded-2xl border border-line bg-surface p-5 md:p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-line">
            Recent Practice Exam Attempts
          </h3>
          <div className="divide-y divide-line space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {data.recentAttempts.map((attempt) => {
              const passed = attempt.scorePercent >= 80;
              return (
                <div key={attempt.id} className="flex items-center justify-between gap-4 py-2.5 hover:bg-slate-50/50 rounded-xl px-2">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {attempt.user.name}
                    </p>
                    <p className="text-[10px] text-muted truncate mt-0.5">
                      {attempt.user.email} · {attempt.examSlug}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] text-slate-500">
                      {Math.round(attempt.timeSpentSeconds / 60)} min spent
                    </span>
                    <span
                      className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                        passed ? "bg-green-100 text-brand-green" : "bg-red-100 text-red-600"
                      }`}
                    >
                      {attempt.scorePercent}%
                    </span>
                  </div>
                </div>
              );
            })}
            {data.recentAttempts.length === 0 && (
              <p className="text-xs text-muted text-center py-12">No exam attempts submitted yet.</p>
            )}
          </div>
        </div>

        {/* CSV Export & Reports Card */}
        <div className="rounded-2xl border border-line bg-surface p-5 md:p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-line">
              Data Exports & Reports
            </h3>
            <p className="text-xs text-muted mt-3 leading-relaxed">
              Export learning records and student exam analytics reports directly to CSV spreadsheets for external processing or audits.
            </p>
          </div>

          <div className="space-y-2.5 pt-4">
            <button
              onClick={exportAttemptsCSV}
              disabled={data.recentAttempts.length === 0}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-navy py-2.5 text-xs font-semibold text-white transition-colors hover:bg-navy-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              📊 Export Exam Attempts Report
            </button>
            <button
              onClick={exportCoursesCSV}
              disabled={data.courseStats.length === 0}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-line py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              🎓 Export Course Metrics Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const accentCardColors = {
  navy: "bg-navy-50 text-navy border-navy/10",
  blue: "bg-blue-50 text-blue-600 border-blue/10",
  green: "bg-green-50 text-brand-green border-green-200/30",
  amber: "bg-amber-50 text-amber-600 border-amber/10",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald/10",
  rose: "bg-rose-50 text-rose-600 border-rose/10",
} as const;

function MetricCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: string | number;
  accent: keyof typeof accentCardColors;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-surface p-4 shadow-sm ${accentCardColors[accent].split(" ")[2]}`}>
      <Icon
        className={`pointer-events-none absolute -right-3 -top-3 h-16 w-16 opacity-[0.06] ${accentCardColors[accent].split(" ")[1]}`}
      />
      <div className="relative flex items-center gap-3">
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${accentCardColors[accent].split(" ").slice(0, 2).join(" ")}`}>
          <Icon className="h-4.5 w-4.5" />
        </span>
        <div className="min-w-0">
          <p className="text-base font-extrabold text-slate-800">{value}</p>
          <p className="truncate text-[10px] font-bold text-muted uppercase tracking-wider mt-0.5">{label}</p>
        </div>
      </div>
    </div>
  );
}
