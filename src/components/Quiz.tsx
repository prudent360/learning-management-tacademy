"use client";

import { useState } from "react";
import type { QuizQuestion } from "@/lib/courses";
import { ProgressRing } from "@/components/ProgressRing";
import {
  CheckIcon,
  CloseIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "@/components/icons";

type Props = {
  questions: QuizQuestion[];
  passMark?: number;
  onPassed?: () => void;
};

export function Quiz({ questions, passMark = 60, onPassed }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [index, setIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const q = questions[index];
  const total = questions.length;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === total;
  const correctCount = questions.filter((qq) => answers[qq.id] === qq.correctId).length;
  const score = Math.round((correctCount / total) * 100);
  const passed = score >= passMark;

  const select = (optId: string) => {
    if (submitted) return;
    setAnswers((a) => ({ ...a, [q.id]: optId }));
  };

  const submit = () => {
    setSubmitted(true);
    if (score >= passMark) onPassed?.();
  };

  const retake = () => {
    setAnswers({});
    setIndex(0);
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-line bg-surface-muted p-5">
        {/* Score header */}
        <div className="flex flex-col items-center gap-4 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <ProgressRing
              value={score}
              size={72}
              stroke={8}
              color={passed ? "var(--green)" : "var(--orange)"}
            />
            <div>
              <p className="text-lg font-bold text-slate-800">
                {passed ? "Nice work — you passed!" : "Almost there"}
              </p>
              <p className="text-sm text-muted">
                You scored {correctCount} of {total} ({score}%). Pass mark is {passMark}%.
              </p>
            </div>
          </div>
          <button
            onClick={retake}
            className="rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-700"
          >
            Retake quiz
          </button>
        </div>

        {/* Per-question review */}
        <div className="mt-5 space-y-4">
          {questions.map((qq, i) => {
            const chosen = answers[qq.id];
            const isCorrect = chosen === qq.correctId;
            return (
              <div key={qq.id} className="rounded-lg border border-line bg-surface p-4">
                <div className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-white ${
                      isCorrect ? "bg-brand-green" : "bg-red-500"
                    }`}
                  >
                    {isCorrect ? (
                      <CheckIcon className="h-3 w-3" />
                    ) : (
                      <CloseIcon className="h-3 w-3" />
                    )}
                  </span>
                  <p className="text-sm font-semibold text-slate-800">
                    {i + 1}. {qq.prompt}
                  </p>
                </div>
                <div className="mt-2 space-y-1 pl-7 text-sm">
                  {qq.options.map((opt) => {
                    const isAnswer = opt.id === qq.correctId;
                    const isChosen = opt.id === chosen;
                    return (
                      <p
                        key={opt.id}
                        className={`${
                          isAnswer
                            ? "font-semibold text-brand-green"
                            : isChosen
                              ? "text-red-500 line-through"
                              : "text-muted"
                        }`}
                      >
                        {opt.text}
                        {isAnswer && " ✓"}
                        {isChosen && !isAnswer && " (your answer)"}
                      </p>
                    );
                  })}
                  <p className="mt-1 text-xs text-slate-500">{qq.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-surface-muted p-5">
      {/* Progress */}
      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between text-xs font-medium text-muted">
          <span>
            Question {index + 1} of {total}
          </span>
          <span>{answeredCount} answered</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-navy-600 transition-all"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <p className="text-base font-bold text-slate-800">{q.prompt}</p>

      <div className="mt-4 space-y-2.5">
        {q.options.map((opt) => {
          const selected = answers[q.id] === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => select(opt.id)}
              className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                selected
                  ? "border-navy-600 bg-navy-50 font-semibold text-navy"
                  : "border-line bg-surface text-slate-700 hover:border-navy-600/40 hover:bg-navy-50/50"
              }`}
            >
              <span
                className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px] font-bold ${
                  selected ? "border-navy-600 bg-navy-600 text-white" : "border-slate-300 text-transparent"
                }`}
              >
                {opt.id.toUpperCase()}
              </span>
              {opt.text}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <button
          onClick={() => setIndex((n) => Math.max(0, n - 1))}
          disabled={index === 0}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back
        </button>

        {index < total - 1 ? (
          <button
            onClick={() => setIndex((n) => Math.min(total - 1, n + 1))}
            className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-700"
          >
            Next
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={!allAnswered}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-green px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CheckCircleIcon className="h-4 w-4" />
            Submit answers
          </button>
        )}
      </div>

      {index === total - 1 && !allAnswered && (
        <p className="mt-2 text-right text-xs text-muted">
          Answer all {total} questions to submit.
        </p>
      )}
    </div>
  );
}
