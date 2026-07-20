"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ExamQuestion, PracticeExam } from "@/lib/aptitude-exams";
import { getExamBySlugAction, getAllExamsAction } from "@/app/actions/exams";
import { saveExamAttemptAction } from "@/app/actions/analytics";
import { useGamification } from "@/lib/useGamification";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  ChevronLeftIcon,
  CheckIcon,
} from "@/components/icons";

function PracticeExamContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const gamification = useGamification();

  const categorySlug = searchParams.get("category");
  const [exam, setExam] = useState<PracticeExam | null>(null);
  const [allExams, setAllExams] = useState<PracticeExam[] | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch exam data dynamically
  useEffect(() => {
    setLoading(true);
    if (categorySlug) {
      getExamBySlugAction(categorySlug)
        .then((ex) => {
          setExam(ex);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      getAllExamsAction()
        .then((exs) => {
          setAllExams(exs);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [categorySlug]);

  // Exam States: "intro" | "testing" | "results" | "review"
  const [examState, setExamState] = useState<"intro" | "testing" | "results" | "review">("intro");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);

  // Initialize timer
  useEffect(() => {
    if (exam && examState === "testing") {
      setTimeLeft(exam.durationMinutes * 60);
      setTimeSpent(0);
    }
  }, [exam, examState]);

  // Tick timer
  useEffect(() => {
    if (examState !== "testing") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [examState]);

  if (loading) {
    return <div className="p-8 text-center text-sm text-slate-400">Loading exam engine...</div>;
  }

  if (!categorySlug || !exam) {
    // If no exam is loaded, display the catalog of exams
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/aptitude"
            className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Aptitude Practice Exams</h1>
            <p className="text-xs text-muted">Test your reasoning skills under pressure</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allExams?.map((ex) => (
            <div
              key={ex.categorySlug}
              className="rounded-2xl border border-line bg-surface p-5 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-base font-bold text-slate-800">{ex.categoryName}</h3>
                <p className="mt-1 text-xs text-muted">
                  {ex.questions.length} Questions · {ex.durationMinutes} Minutes
                </p>
                <p className="mt-3 text-xs text-slate-600">
                  Simulate assessment conditions for {ex.categoryName.toLowerCase()} with timers and worked steps.
                </p>
              </div>
              <button
                onClick={() => router.push(`/aptitude/practice-exam?category=${ex.categorySlug}`)}
                className="mt-5 w-full rounded-lg bg-navy py-2 text-center text-xs font-semibold text-white transition-colors hover:bg-navy-700"
              >
                Launch Exam
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const currentQuestion = exam.questions[currentIdx];
  const scorePercent = Math.round(
    (exam.questions.reduce((acc, q) => acc + (answers[q.id] === q.correctId ? 1 : 0), 0) /
      exam.questions.length) *
      100
  );

  const startExam = () => {
    setAnswers({});
    setFlagged([]);
    setCurrentIdx(0);
    setExamState("testing");
  };

  const toggleFlag = (qId: string) => {
    setFlagged((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  const selectAnswer = (qId: string, optId: string) => {
    if (examState !== "testing") return;
    setAnswers((prev) => ({ ...prev, [qId]: optId }));
  };

  const handleSubmit = () => {
    setExamState("results");
    
    if (categorySlug) {
      saveExamAttemptAction(categorySlug, scorePercent, timeSpent).catch((err) => {
        console.error("Failed to save exam attempt", err);
      });
    }
    
    // Reward XP & Level check
    if (gamification.ready) {
      const isPass = scorePercent >= 80;
      let xpEarned = 50; // default participation XP
      if (isPass) {
        xpEarned = 100;
        gamification.unlockBadge("exam-champ");
      }
      gamification.addXP(xpEarned);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (examState === "testing") {
                if (confirm("Are you sure you want to exit the exam? Your progress will be lost.")) {
                  router.push("/aptitude");
                }
              } else {
                router.push("/aptitude");
              }
            }}
            className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-800">{exam.categoryName} Exam</h1>
            <p className="text-xs text-muted">Aptitude Engine Reasoning Series</p>
          </div>
        </div>

        {examState === "testing" && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3.5 py-1.5 text-red-600 text-sm font-bold animate-pulse">
            <ClockIcon className="h-4 w-4" />
            <span>Time Left: {formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      {/* Intro State */}
      {examState === "intro" && (
        <div className="mx-auto max-w-xl rounded-2xl bg-surface p-6 md:p-8 text-center border border-line shadow-sm">
          <span className="text-5xl">📝</span>
          <h2 className="mt-4 text-xl font-extrabold text-slate-800">Ready to begin?</h2>
          <p className="mt-2 text-sm text-slate-600">
            You are about to start the <strong>{exam.categoryName}</strong> practice assessment under realistic conditions.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-surface-muted p-4 text-left text-sm border border-line/60">
            <div>
              <p className="text-xs text-muted">Questions</p>
              <p className="mt-0.5 font-bold text-slate-800">{exam.questions.length} total</p>
            </div>
            <div>
              <p className="text-xs text-muted">Time Limit</p>
              <p className="mt-0.5 font-bold text-slate-800">{exam.durationMinutes} Minutes</p>
            </div>
          </div>

          <div className="mt-6 text-left text-xs text-slate-500 space-y-2">
            <p>💡 <strong>Note:</strong> Closing this window or clicking back will abandon your progress.</p>
            <p>🔥 <strong>XP Reward:</strong> Scoring 80%+ awards 100 XP and unlocks the Exam Champ badge!</p>
          </div>

          <button
            onClick={startExam}
            className="mt-8 w-full rounded-lg bg-navy py-3 font-semibold text-white transition-colors hover:bg-navy-700 shadow-sm"
          >
            Start Practice Test
          </button>
        </div>
      )}

      {/* Testing State */}
      {examState === "testing" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
          {/* Question card */}
          <div className="rounded-2xl bg-surface p-5 md:p-6 border border-line">
            <div className="flex items-center justify-between border-b border-line pb-4 mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Question {currentIdx + 1} of {exam.questions.length}
              </span>
              <button
                onClick={() => toggleFlag(currentQuestion.id)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  flagged.includes(currentQuestion.id)
                    ? "border-orange bg-orange-50 text-orange-600"
                    : "border-line text-slate-500 hover:bg-slate-50"
                }`}
              >
                <span>🚩</span>
                {flagged.includes(currentQuestion.id) ? "Flagged" : "Flag Question"}
              </button>
            </div>

            <p className="text-base font-bold text-slate-800 mb-6 leading-relaxed">
              {currentQuestion.prompt}
            </p>

            <div className="space-y-3">
              {currentQuestion.options.map((opt) => {
                const isSelected = answers[currentQuestion.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => selectAnswer(currentQuestion.id, opt.id)}
                    className={`w-full flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                      isSelected
                        ? "border-navy bg-navy-50 text-navy font-semibold shadow-sm"
                        : "border-line hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span
                      className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 text-xs font-bold ${
                        isSelected
                          ? "border-navy bg-navy text-white"
                          : "border-slate-300 text-slate-400"
                      }`}
                    >
                      {opt.id.toUpperCase()}
                    </span>
                    <span className="text-sm">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 flex justify-between border-t border-line pt-5">
              <button
                onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                disabled={currentIdx === 0}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Previous
              </button>

              {currentIdx < exam.questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIdx((i) => i + 1)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-700 transition-colors"
                >
                  Next
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-green px-5 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors shadow-sm"
                >
                  Submit Exam
                </button>
              )}
            </div>
          </div>

          {/* Navigation Panel */}
          <div className="rounded-2xl bg-surface p-5 border border-line h-fit lg:sticky lg:top-24">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Exam Navigation</h3>
            <div className="grid grid-cols-5 gap-2">
              {exam.questions.map((q, i) => {
                const isCurrent = i === currentIdx;
                const isAnswered = !!answers[q.id];
                const isFlagged = flagged.includes(q.id);

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(i)}
                    className={`relative grid h-10 w-10 place-items-center rounded-lg border text-xs font-bold transition-all ${
                      isCurrent
                        ? "border-navy bg-navy text-white scale-105"
                        : isFlagged
                          ? "border-orange bg-orange-50 text-orange-600"
                          : isAnswered
                            ? "border-green-200 bg-green-50 text-brand-green"
                            : "border-line text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {i + 1}
                    {isFlagged && (
                      <span className="absolute -top-1.5 -right-1.5 text-[9px]">🚩</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 border-t border-line/60 pt-4 space-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-navy" />
                <span>Current Question</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-green-50 border border-green-200" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-orange-50 border border-orange" />
                <span>Flagged / Skipped</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results State */}
      {examState === "results" && (
        <div className="mx-auto max-w-xl rounded-2xl bg-surface p-6 md:p-8 text-center border border-line shadow-sm">
          <span className="text-5xl">🎉</span>
          <h2 className="mt-4 text-2xl font-extrabold text-slate-800">Exam Complete!</h2>
          <p className="mt-2 text-sm text-slate-500">
            You completed the {exam.categoryName} practice test in {formatTime(timeSpent)}.
          </p>

          {/* Score Circle */}
          <div className="my-8 flex justify-center">
            <div className="relative grid h-32 w-32 place-items-center rounded-full bg-slate-50 border-4 border-slate-100 shadow-inner">
              <div>
                <p className="text-4xl font-extrabold text-slate-800">{scorePercent}%</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">
                  Score
                </p>
              </div>
            </div>
          </div>

          {scorePercent >= 80 ? (
            <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-brand-green text-sm font-semibold max-w-md mx-auto mb-6">
              🔥 Outstanding work! You passed with {scorePercent}% (+100 XP awarded).
            </div>
          ) : (
            <div className="rounded-xl bg-orange-50 border border-orange-200 p-4 text-orange-600 text-sm font-medium max-w-md mx-auto mb-6">
              You scored {scorePercent}%. Aim for 80% or higher to unlock the Exam Champ badge! (+50 XP awarded).
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setExamState("review")}
              className="rounded-lg border border-line py-3 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Review Answers
            </button>
            <button
              onClick={() => {
                router.push("/aptitude");
              }}
              className="rounded-lg bg-navy py-3 font-semibold text-white hover:bg-navy-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Review State */}
      {examState === "review" && (
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">Review Answers & Explanations</h2>
            <button
              onClick={() => router.push("/aptitude")}
              className="rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white hover:bg-navy-700 transition-colors"
            >
              Exit Review
            </button>
          </div>

          <div className="space-y-6">
            {exam.questions.map((q, idx) => {
              const userAns = answers[q.id];
              const isCorrect = userAns === q.correctId;

              return (
                <div key={q.id} className="rounded-2xl border border-line bg-surface p-5 md:p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-line pb-3">
                    <span className="text-xs font-semibold text-slate-500">
                      Question {idx + 1}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        isCorrect ? "bg-green-100 text-brand-green" : "bg-red-100 text-red-600"
                      }`}
                    >
                      {isCorrect ? "Correct" : "Incorrect"}
                    </span>
                  </div>

                  <p className="text-sm font-bold text-slate-800">{q.prompt}</p>

                  <div className="space-y-2">
                    {q.options.map((opt) => {
                      const selected = userAns === opt.id;
                      const correct = q.correctId === opt.id;

                      let style = "border-line text-slate-700";
                      if (correct) {
                        style = "border-green-300 bg-green-50 text-brand-green font-semibold";
                      } else if (selected) {
                        style = "border-red-300 bg-red-50 text-red-600 font-semibold";
                      }

                      return (
                        <div
                          key={opt.id}
                          className={`flex items-center gap-3 rounded-lg border p-3.5 text-xs text-left ${style}`}
                        >
                          <span
                            className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px] font-bold ${
                              correct
                                ? "bg-brand-green border-brand-green text-white"
                                : selected
                                  ? "bg-red-600 border-red-600 text-white"
                                  : "border-slate-300 text-slate-400"
                            }`}
                          >
                            {opt.id.toUpperCase()}
                          </span>
                          <span>{opt.text}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4 border border-line/60 text-xs">
                    <p className="font-bold text-navy uppercase tracking-wider mb-1.5">Worked Explanation</p>
                    <p className="text-slate-600 leading-relaxed font-sans">{q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PracticeExamPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-400">Loading exam engine...</div>}>
      <PracticeExamContent />
    </Suspense>
  );
}
