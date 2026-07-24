"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Course, Lesson, LessonType } from "@/lib/courses";
import { allLessons, lessonCount } from "@/lib/courses";
import { useProgress } from "@/lib/useProgress";
import { useGamification } from "@/lib/useGamification";
import { CertificateModal } from "@/components/CertificateModal";
import { LessonDiscussion } from "@/components/LessonDiscussion";
import { StudentJourneyTimeline } from "@/components/StudentJourneyTimeline";
import { AttendanceSummary } from "@/components/AttendanceSummary";
import { AssignmentsSummary } from "@/components/AssignmentsSummary";
import { Quiz } from "@/components/Quiz";
import type { JourneySummary } from "@/app/actions/journey";
import type { MyAttendanceSummary } from "@/app/actions/attendance";
import type { MyAssignmentRow } from "@/app/actions/assignments";
import type { CurrentUser } from "@/lib/dal";
import {
  PlayIcon,
  BookIcon,
  QuizIcon,
  ClockIcon,
  CheckIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@/components/icons";

const typeIcon: Record<LessonType, typeof PlayIcon> = {
  video: PlayIcon,
  reading: BookIcon,
  quiz: QuizIcon,
};

const typeLabel: Record<LessonType, string> = {
  video: "Video lesson",
  reading: "Reading",
  quiz: "Practice quiz",
};

export interface CoursePlayerProps {
  course: Course;
  journey?: JourneySummary | null;
  attendance?: MyAttendanceSummary | null;
  assignments?: MyAssignmentRow[];
  /** Pre-fetched server-side (this page lives outside the `(app)` route group, so useCurrentUser()'s UserProvider isn't mounted here). Null for a guest previewing a free course. */
  viewer?: CurrentUser | null;
}

export function CoursePlayer({ course, journey, attendance, assignments, viewer }: CoursePlayerProps) {
  const flat = useMemo(() => allLessons(course), [course]);
  const total = lessonCount(course);
  const { isDone, setComplete, count, ready } = useProgress(course.slug);
  const gamification = useGamification();
  const [showCertificate, setShowCertificate] = useState(false);

  const [activeId, setActiveId] = useState(flat[0]?.id);
  const activeIndex = flat.findIndex((l) => l.id === activeId);
  const active = flat[activeIndex] ?? flat[0];
  const pct = total ? Math.round((count / total) * 100) : 0;

  const goTo = (id: string) => setActiveId(id);
  const prev = flat[activeIndex - 1];
  const next = flat[activeIndex + 1];

  const handleMarkComplete = (lessonId: string, value: boolean) => {
    const alreadyDone = isDone(lessonId);
    if (value && !alreadyDone) {
      gamification.addXP(50);
      gamification.unlockBadge("first-step");
    }
    setComplete(lessonId, value);
  };

  const completeAndContinue = () => {
    handleMarkComplete(active.id, true);
    if (next) setActiveId(next.id);
  };

  // Sync course completion badge
  useEffect(() => {
    if (
      pct === 100 &&
      ready &&
      gamification.ready &&
      !gamification.badges.includes("course-master")
    ) {
      gamification.unlockBadge("course-master");
    }
  }, [pct, ready, gamification.ready, gamification.badges, gamification.unlockBadge]);

  const ActiveTypeIcon = typeIcon[active.type];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-navy px-5 py-4 md:px-6">
        <Link
          href="/my-courses"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-white/70 transition-colors hover:text-white"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          My Courses
        </Link>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">{course.title}</h1>
            <p className="text-sm text-white/70">{course.subtitle}</p>
          </div>
          <div className="min-w-48">
            <div className="mb-1 flex items-center justify-between text-xs text-white/80">
              <span>{ready ? `${count} of ${total} complete` : "Loading…"}</span>
              <span className="font-semibold">{ready ? `${pct}%` : ""}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-orange transition-all"
                style={{ width: `${ready ? pct : 0}%` }}
              />
            </div>
            {ready && pct === 100 && (
              <button
                onClick={() => setShowCertificate(true)}
                className="mt-2 w-full rounded-lg bg-orange px-3 py-1.5 text-center text-xs font-bold text-white shadow-sm hover:bg-orange-600 transition-colors"
              >
                🎓 View Certificate
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        {/* Lesson pane */}
        <div className="min-w-0 space-y-5 rounded-2xl bg-surface p-5 md:p-6">
          {/* Media / header block */}
          {active.type === "video" ? (
            active.videoUrl ? (
              <div className="relative overflow-hidden rounded-xl bg-black aspect-video">
                <LessonVideo url={active.videoUrl} />
              </div>
            ) : (
              <div className="relative grid aspect-video place-items-center rounded-xl bg-gradient-to-br from-navy to-navy-700">
                <div className="text-center space-y-2">
                  <button className="grid h-16 w-16 mx-auto place-items-center rounded-full bg-white/20 text-white backdrop-blur transition-transform hover:scale-105">
                    <PlayIcon className="h-8 w-8" />
                  </button>
                  <p className="text-xs text-white/60">No video URL configured</p>
                </div>
                <span className="absolute bottom-3 right-3 rounded bg-black/40 px-2 py-0.5 text-xs font-medium text-white">
                  {active.duration}:00
                </span>
              </div>
            )
          ) : (
            <div className="flex items-center gap-3 rounded-xl bg-surface-muted p-4">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-navy-50 text-navy">
                <ActiveTypeIcon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-800">{typeLabel[active.type]}</p>
                <p className="text-xs text-muted">{active.duration} min</p>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-muted">
              <ActiveTypeIcon className="h-4 w-4" />
              {typeLabel[active.type]}
              <span className="text-slate-300">·</span>
              <ClockIcon className="h-4 w-4" />
              {active.duration} min
            </div>
            <h2 className="mt-2 text-xl font-bold text-slate-800">{active.title}</h2>
          </div>

          <div className="space-y-3 text-sm leading-relaxed text-slate-600">
            {active.content.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {active.type === "quiz" && active.questions?.length ? (
            <Quiz
              key={active.id}
              questions={active.questions}
              onPassed={() => handleMarkComplete(active.id, true)}
            />
          ) : null}

          {/* Actions */}
          <div className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={() => prev && setActiveId(prev.id)}
              disabled={!prev}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Previous
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleMarkComplete(active.id, !isDone(active.id))}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors ${
                  isDone(active.id)
                    ? "border-brand-green/30 bg-green-50 text-brand-green"
                    : "border-line text-slate-600 hover:bg-surface-muted"
                }`}
              >
                <CheckCircleIcon className="h-4 w-4" />
                {isDone(active.id) ? "Completed" : "Mark complete"}
              </button>

              <button
                onClick={completeAndContinue}
                className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-700"
              >
                {next ? "Complete & continue" : "Complete course"}
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Discussion Comments Thread */}
          {active.dbId && (
            <div className="border-t border-line pt-6 mt-6">
              <LessonDiscussion lessonId={active.dbId} viewer={viewer} />
            </div>
          )}
        </div>

        {/* Outline */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {journey && <StudentJourneyTimeline journey={journey} />}
          {attendance && <AttendanceSummary attendance={attendance} />}
          {assignments && assignments.length > 0 && <AssignmentsSummary assignments={assignments} />}
          <div className="rounded-2xl bg-surface p-4">
          <div className="px-2 py-2">
            <p className="text-sm font-bold text-slate-800">Course content</p>
            <p className="text-xs text-muted">
              {course.modules.length} modules · {total} lessons
            </p>
          </div>

          <div className="scroll-thin max-h-[65vh] space-y-4 overflow-y-auto pr-1">
            {course.modules.map((mod, mi) => (
              <div key={mod.id}>
                <p className="px-2 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  {mi + 1}. {mod.title}
                </p>
                <div className="space-y-1">
                  {mod.lessons.map((lesson) => (
                    <OutlineRow
                      key={lesson.id}
                      lesson={lesson}
                      active={lesson.id === active.id}
                      done={ready && isDone(lesson.id)}
                      onClick={() => goTo(lesson.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          </div>
        </aside>
      </div>
      {showCertificate && (
        <CertificateModal
          courseSlug={course.slug}
          courseTitle={course.title}
          studentName={viewer?.certificateName ?? viewer?.name ?? ""}
          instructorName={course.instructor}
          onClose={() => setShowCertificate(false)}
        />
      )}
    </div>
  );
}

function OutlineRow({
  lesson,
  active,
  done,
  onClick,
}: {
  lesson: Lesson;
  active: boolean;
  done: boolean;
  onClick: () => void;
}) {
  const Icon = typeIcon[lesson.type];
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
        active ? "bg-navy-50" : "hover:bg-surface-muted"
      }`}
    >
      <span
        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${
          done
            ? "bg-brand-green text-white"
            : active
              ? "bg-navy text-white"
              : "bg-slate-100 text-slate-400"
        }`}
      >
        {done ? <CheckIcon className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`block truncate text-sm ${
            active ? "font-semibold text-navy" : "font-medium text-slate-700"
          }`}
        >
          {lesson.title}
        </span>
        <span className="text-xs text-muted">{lesson.duration} min</span>
      </span>
    </button>
  );
}

/** Embeds a video from YouTube, Vimeo, or a direct .mp4 URL. */
function LessonVideo({ url }: { url: string }) {
  const embedUrl = toEmbedUrl(url);

  if (embedUrl.match(/\.mp4(\?|$)/i)) {
    return (
      <video
        src={embedUrl}
        controls
        className="w-full h-full object-contain"
        controlsList="nodownload"
      />
    );
  }

  return (
    <iframe
      src={embedUrl}
      className="w-full h-full"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      title="Lesson video"
    />
  );
}

function toEmbedUrl(url: string): string {
  // YouTube: watch, share, shorts → embed
  const ytMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{11})/
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  return url;
}
