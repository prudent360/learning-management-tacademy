"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { savePracticeExamAction } from "@/app/actions/admin-content";
import { ChevronLeftIcon, TrashIcon } from "@/components/icons";
import type { PracticeExam } from "@/lib/aptitude-exams";

type ExamEditorProps = {
  exam?: PracticeExam;
};

type ActiveSelection =
  | { type: "exam" }
  | { type: "question"; questionIndex: number };

export function ExamEditor({ exam: initialExam }: ExamEditorProps) {
  const router = useRouter();
  const [exam, setExam] = useState<any>(
    initialExam || {
      categorySlug: "",
      categoryName: "",
      durationMinutes: 5,
      questions: [],
    }
  );
  const [active, setActive] = useState<ActiveSelection>({ type: "exam" });
  const [saving, setSaving] = useState(false);

  const isNew = !initialExam;

  const handleSave = async () => {
    if (!exam.categorySlug || !exam.categoryName) {
      alert("Exam category slug and name are required!");
      return;
    }
    setSaving(true);
    try {
      const res = await savePracticeExamAction(exam);
      if (res.success) {
        alert("Practice exam saved successfully!");
        router.push("/admin/exams");
        router.refresh();
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to save exam");
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = () => {
    const defaultOpts = [
      { id: "a", text: "Option A" },
      { id: "b", text: "Option B" },
      { id: "c", text: "Option C" },
      { id: "d", text: "Option D" },
    ];
    const newQ = {
      id: `q${exam.questions.length + 1}`,
      prompt: "Insert your question prompt here",
      options: defaultOpts,
      correctId: "a",
      explanation: "Worked step description",
    };
    setExam({
      ...exam,
      questions: [...exam.questions, newQ],
    });
    setActive({ type: "question", questionIndex: exam.questions.length });
  };

  const deleteQuestion = (qIdx: number) => {
    const updated = exam.questions.filter((_: any, i: number) => i !== qIdx);
    setExam({ ...exam, questions: updated });
    setActive({ type: "exam" });
  };

  const addOption = (qIdx: number) => {
    const q = exam.questions[qIdx];
    const nextChar = String.fromCharCode(97 + q.options.length); // 'a' + index
    const updatedOpts = [...q.options, { id: nextChar, text: `Option ${nextChar.toUpperCase()}` }];
    const updatedQs = [...exam.questions];
    updatedQs[qIdx] = { ...q, options: updatedOpts };
    setExam({ ...exam, questions: updatedQs });
  };

  const deleteOption = (qIdx: number, oIdx: number) => {
    const q = exam.questions[qIdx];
    const updatedOpts = q.options.filter((_: any, i: number) => i !== oIdx);
    const updatedQs = [...exam.questions];
    updatedQs[qIdx] = { ...q, options: updatedOpts };
    setExam({ ...exam, questions: updatedQs });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/exams"
            className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              {isNew ? "Create Practice Exam" : `Edit: ${exam.categoryName}`}
            </h1>
            <p className="text-xs text-muted">
              {isNew ? "Add a new dynamic aptitude test series" : "Modify basic parameters and questions"}
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-700 disabled:opacity-55"
        >
          {saving ? "Saving Changes..." : "Save Exam"}
        </button>
      </div>

      {/* Editor Body */}
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
        {/* Left Tree */}
        <div className="space-y-4">
          <button
            onClick={() => setActive({ type: "exam" })}
            className={`w-full text-left p-3 rounded-lg border text-sm font-semibold transition-all ${
              active.type === "exam"
                ? "border-navy bg-navy/5 text-navy shadow-sm"
                : "border-line bg-surface hover:bg-slate-50 text-slate-800"
            }`}
          >
            📝 Exam Parameters
          </button>

          <div className="border border-line rounded-xl bg-surface p-3 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Questions</span>
              <button
                onClick={addQuestion}
                className="text-[11px] font-bold text-navy hover:text-navy-700 bg-navy/5 px-2 py-1 rounded"
              >
                + Add Q
              </button>
            </div>

            <div className="space-y-1">
              {exam.questions.map((q: any, qIdx: number) => {
                const isQActive = active.type === "question" && active.questionIndex === qIdx;
                return (
                  <div key={q.id || qIdx} className="flex items-center justify-between gap-1 group">
                    <button
                      onClick={() => setActive({ type: "question", questionIndex: qIdx })}
                      className={`flex-1 text-left px-2.5 py-1.5 rounded text-xs font-medium truncate transition-colors ${
                        isQActive ? "bg-slate-200 text-slate-800 font-semibold" : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      ❓ Q{qIdx + 1}: {q.prompt}
                    </button>
                    <button
                      onClick={() => deleteQuestion(qIdx)}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-1"
                      title="Delete Question"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
              {exam.questions.length === 0 && (
                <p className="text-[11px] text-muted text-center py-4">No questions created. Click Add Q.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Pane */}
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm min-h-[400px]">
          {active.type === "exam" ? (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-800">Exam Parameters</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category Slug</label>
                  <input
                    type="text"
                    disabled={!isNew}
                    value={exam.categorySlug}
                    onChange={(e) => setExam({ ...exam, categorySlug: e.target.value })}
                    placeholder="e.g. situational-judgement"
                    className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy disabled:bg-slate-50 disabled:text-muted"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={exam.durationMinutes}
                    onChange={(e) => setExam({ ...exam, durationMinutes: Number(e.target.value) })}
                    placeholder="5"
                    className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category Name</label>
                <input
                  type="text"
                  value={exam.categoryName}
                  onChange={(e) => setExam({ ...exam, categoryName: e.target.value })}
                  placeholder="e.g. Situational Judgement"
                  className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
                />
              </div>
            </div>
          ) : (
            // Edit Question
            (() => {
              const qIdx = active.questionIndex;
              const q = exam.questions[qIdx];
              return (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-bold text-slate-800">Question {qIdx + 1} Settings</h3>
                    <button
                      onClick={() => deleteQuestion(qIdx)}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"
                    >
                      Delete Question
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Question ID (e.g. ct1)</label>
                      <input
                        type="text"
                        value={q.id || ""}
                        onChange={(e) => {
                          const updated = [...exam.questions];
                          updated[qIdx] = { ...q, id: e.target.value };
                          setExam({ ...exam, questions: updated });
                        }}
                        className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Correct Answer ID</label>
                      <select
                        value={q.correctId}
                        onChange={(e) => {
                          const updated = [...exam.questions];
                          updated[qIdx] = { ...q, correctId: e.target.value };
                          setExam({ ...exam, questions: updated });
                        }}
                        className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
                      >
                        {q.options.map((opt: any) => (
                          <option key={opt.id} value={opt.id}>
                            Option {opt.id.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Question Prompt</label>
                    <textarea
                      rows={4}
                      value={q.prompt}
                      onChange={(e) => {
                        const updated = [...exam.questions];
                        updated[qIdx] = { ...q, prompt: e.target.value };
                        setExam({ ...exam, questions: updated });
                      }}
                      placeholder="Insert context passage, instructions, or prompt text..."
                      className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy resize-y"
                    />
                  </div>

                  <div className="space-y-2 border border-line rounded-xl p-4 bg-surface-muted/30">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-800">Answer Options</span>
                      <button
                        onClick={() => addOption(qIdx)}
                        className="text-[10px] font-bold text-navy hover:text-navy-700 bg-navy/5 px-2 py-0.5 rounded"
                      >
                        + Add Option
                      </button>
                    </div>
                    {q.options.map((opt: any, oIdx: number) => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700 w-5">{opt.id.toUpperCase()}:</span>
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => {
                            const updatedOpts = [...q.options];
                            updatedOpts[oIdx] = { ...opt, text: e.target.value };
                            const updated = [...exam.questions];
                            updated[qIdx] = { ...q, options: updatedOpts };
                            setExam({ ...exam, questions: updated });
                          }}
                          className="flex-1 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs outline-none focus:border-navy"
                        />
                        <button
                          onClick={() => deleteOption(qIdx, oIdx)}
                          className="text-red-500 hover:text-red-700 p-1 transition-colors"
                          title="Delete Option"
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Explanation</label>
                    <textarea
                      rows={3}
                      value={q.explanation}
                      onChange={(e) => {
                        const updated = [...exam.questions];
                        updated[qIdx] = { ...q, explanation: e.target.value };
                        setExam({ ...exam, questions: updated });
                      }}
                      placeholder="Explain the logic behind the correct answer..."
                      className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy resize-y"
                    />
                  </div>
                </div>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
}
