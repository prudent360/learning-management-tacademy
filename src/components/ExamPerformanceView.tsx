"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";
import { AnalyticsIcon, ClockIcon, TrophyIcon, CheckIcon } from "@/components/icons";
import type { ExamPerformance } from "@/app/actions/exam-performance";

import Link from "next/link";

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function TrendTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number | null; name: string; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-md">
      <p className="font-bold text-slate-700">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value ?? "—"}%
        </p>
      ))}
    </div>
  );
}

function Sparkline({ scores }: { scores: number[] }) {
  if (scores.length < 2) {
    return <div className="h-10 w-full" />;
  }
  const data = scores.map((s, i) => ({ i, s }));
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const trendingUp = scores[scores.length - 1] >= scores[0];
  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`spark-${trendingUp ? "up" : "down"}`} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor={trendingUp ? "var(--brand-green)" : "var(--orange)"}
              stopOpacity={0.35}
            />
            <stop
              offset="100%"
              stopColor={trendingUp ? "var(--brand-green)" : "var(--orange)"}
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <YAxis domain={[min - 5, max + 5]} hide />
        <Area
          type="monotone"
          dataKey="s"
          stroke={trendingUp ? "var(--brand-green)" : "var(--orange)"}
          strokeWidth={2}
          fill={`url(#spark-${trendingUp ? "up" : "down"})`}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function CategoryCard({ category }: { category: ExamPerformance["categories"][number] }) {
  const radialData = [{ name: "score", value: category.avgScore, fill: "var(--navy)" }];
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="flex items-center gap-3">
        <div className="relative h-16 w-16 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              data={radialData}
              innerRadius="70%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar dataKey="value" background={{ fill: "var(--surface-muted)" }} cornerRadius={8} />
            </RadialBarChart>
          </ResponsiveContainer>
          <span className="absolute inset-0 grid place-items-center text-xs font-bold text-slate-700">
            {category.avgScore}%
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold text-slate-800">{category.name}</h3>
          <p className="text-xs text-muted">
            {category.attempts} attempt{category.attempts === 1 ? "" : "s"} · Best {category.bestScore}%
          </p>
          <span
            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              category.passRate >= 80
                ? "bg-green-50 text-brand-green"
                : "bg-orange-50 text-orange-600"
            }`}
          >
            {category.passRate}% pass rate
          </span>
        </div>
      </div>
      <div className="mt-2">
        <Sparkline scores={category.trend} />
      </div>
    </div>
  );
}

export function ExamPerformanceView({ data }: { data: ExamPerformance }) {
  const hasData = data.totalAttempts > 0;

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-navy px-6 py-3.5">
        <h1 className="flex items-center gap-2 text-base font-bold text-white">
          <AnalyticsIcon className="h-5 w-5" />
          Exam Performance Analytics
        </h1>
      </div>

      {!hasData ? (
        <div className="rounded-2xl bg-surface p-8 text-center">
          <p className="text-sm font-semibold text-slate-700">No practice exams taken yet</p>
          <p className="mt-1 text-xs text-muted">
            Complete a practice exam to start building your performance history here.
          </p>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-line bg-surface p-4">
              <p className="text-xs font-semibold text-muted">Total Attempts</p>
              <p className="mt-1 text-xl font-extrabold text-slate-800">{data.totalAttempts}</p>
            </div>
            <div className="rounded-xl border border-line bg-surface p-4">
              <p className="text-xs font-semibold text-muted">Average Score</p>
              <p className="mt-1 text-xl font-extrabold text-navy">{data.avgScore}%</p>
            </div>
            <div className="rounded-xl border border-line bg-surface p-4">
              <p className="text-xs font-semibold text-muted">Pass Rate</p>
              <p className="mt-1 text-xl font-extrabold text-brand-green">{data.passRate}%</p>
            </div>
            <div className="rounded-xl border border-line bg-surface p-4">
              <p className="flex items-center gap-1 text-xs font-semibold text-muted">
                <TrophyIcon className="h-3.5 w-3.5" /> Best Category
              </p>
              <p className="mt-1 truncate text-base font-extrabold text-slate-800">
                {data.bestCategory ?? "—"}
              </p>
            </div>
          </div>

          {/* Score trend chart */}
          <div className="rounded-2xl border border-line bg-surface p-5 md:p-6">
            <h2 className="text-sm font-bold text-slate-800">Score Trend</h2>
            <p className="text-xs text-muted">Your average score vs. the site-wide average, by month</p>
            <div className="mt-4 h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.scoreTrend} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                  <defs>
                    <linearGradient id="yourScoreFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--navy)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--navy)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "var(--text-muted)" }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "var(--text-muted)" }}
                  />
                  <Tooltip content={<TrendTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="yourScore"
                    name="Your score"
                    stroke="var(--navy)"
                    strokeWidth={2.5}
                    fill="url(#yourScoreFill)"
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="siteAverage"
                    name="Site average"
                    stroke="var(--orange)"
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-navy" /> Your score
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-orange" /> Site average
              </span>
            </div>
          </div>

          {/* Category breakdown */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-800">Performance by Category</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.categories.map((c) => (
                <CategoryCard key={c.slug} category={c} />
              ))}
            </div>
          </div>

          {/* Recent attempts table */}
          <div className="rounded-2xl border border-line bg-surface p-5 md:p-6">
            <h2 className="text-sm font-bold text-slate-800">Recent Attempts</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs font-semibold uppercase tracking-wide text-muted">
                    <th className="pb-2 pr-4">Category</th>
                    <th className="pb-2 pr-4">Date</th>
                    <th className="pb-2 pr-4">Time Spent</th>
                    <th className="pb-2 pr-4 text-center">Score</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentAttempts.map((a) => (
                    <tr key={a.id} className="border-b border-line/60 last:border-0">
                      <td className="py-2.5 pr-4 font-medium text-slate-700">{a.category}</td>
                      <td className="py-2.5 pr-4 text-muted">{formatDate(a.completedAt)}</td>
                      <td className="py-2.5 pr-4 text-muted">
                        <span className="inline-flex items-center gap-1">
                          <ClockIcon className="h-3.5 w-3.5" />
                          {formatDuration(a.timeSpentSeconds)}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                            a.passed
                              ? "bg-green-50 text-brand-green"
                              : "bg-orange-50 text-orange-600"
                          }`}
                        >
                          {a.passed && <CheckIcon className="h-3 w-3" />}
                          {a.scorePercent}%
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <Link
                          href={`/aptitude/practice-exam?category=${a.categorySlug}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-2.5 py-1 text-xs font-semibold text-navy transition-colors hover:bg-slate-50"
                        >
                          Practice Again
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
