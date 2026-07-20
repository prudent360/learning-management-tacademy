"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveCourseAction } from "@/app/actions/admin-content";
import { ChevronLeftIcon, TrashIcon, BookIcon, ClipboardIcon } from "@/components/icons";
import { currencySymbol } from "@/lib/currency";
import type { Course } from "@/lib/courses";

type CourseEditorProps = {
  course?: Course;
  currency: string;
  instructors: { id: string; name: string; email: string }[];
  canEditInstructorAssignment: boolean;
};

type ActiveSelection =
  | { type: "course" }
  | { type: "module"; moduleIndex: number }
  | { type: "lesson"; moduleIndex: number; lessonIndex: number }
  | { type: "question"; moduleIndex: number; lessonIndex: number; questionIndex: number };

export function CourseEditor({
  course: initialCourse,
  currency,
  instructors,
  canEditInstructorAssignment,
}: CourseEditorProps) {
  const router = useRouter();
  const [course, setCourse] = useState<any>(
    initialCourse || {
      slug: "",
      title: "",
      subtitle: "",
      category: "Numerical Reasoning",
      instructor: "",
      cover: "from-navy to-navy-700",
      description: "",
      modules: [],
    }
  );
  const [active, setActive] = useState<ActiveSelection>({ type: "course" });
  const [saving, setSaving] = useState(false);

  const isNew = !initialCourse;

  const handleSave = async () => {
    if (!course.slug || !course.title) {
      alert("Course Slug and Title are required!");
      return;
    }
    setSaving(true);
    try {
      const res = await saveCourseAction(course);
      if (res.success) {
        alert("Course saved successfully!");
        router.push("/admin/courses");
        router.refresh();
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to save course");
    } finally {
      setSaving(false);
    }
  };

  const addModule = () => {
    const newModule = {
      id: `m${course.modules.length + 1}`,
      title: `Module ${course.modules.length + 1}`,
      lessons: [],
    };
    setCourse({
      ...course,
      modules: [...course.modules, newModule],
    });
    setActive({ type: "module", moduleIndex: course.modules.length });
  };

  const deleteModule = (mIdx: number) => {
    const updated = course.modules.filter((_: any, i: number) => i !== mIdx);
    setCourse({ ...course, modules: updated });
    setActive({ type: "course" });
  };

  const addLesson = (mIdx: number) => {
    const m = course.modules[mIdx];
    const newLesson = {
      id: `l${m.lessons.length + 1}`,
      title: `New Lesson ${m.lessons.length + 1}`,
      type: "reading",
      duration: 5,
      content: ["Placeholder content. Add your details here."],
      questions: [],
    };
    const updatedModules = [...course.modules];
    updatedModules[mIdx] = {
      ...m,
      lessons: [...m.lessons, newLesson],
    };
    setCourse({ ...course, modules: updatedModules });
    setActive({ type: "lesson", moduleIndex: mIdx, lessonIndex: m.lessons.length });
  };

  const deleteLesson = (mIdx: number, lIdx: number) => {
    const m = course.modules[mIdx];
    const updatedLessons = m.lessons.filter((_: any, i: number) => i !== lIdx);
    const updatedModules = [...course.modules];
    updatedModules[mIdx] = { ...m, lessons: updatedLessons };
    setCourse({ ...course, modules: updatedModules });
    setActive({ type: "module", moduleIndex: mIdx });
  };

  const addQuestion = (mIdx: number, lIdx: number) => {
    const l = course.modules[mIdx].lessons[lIdx];
    const newQ = {
      id: `q${(l.questions || []).length + 1}`,
      prompt: "New Quiz Question",
      options: [
        { id: "a", text: "Option A" },
        { id: "b", text: "Option B" },
        { id: "c", text: "Option C" },
        { id: "d", text: "Option D" },
      ],
      correctId: "a",
      explanation: "Worked step description",
    };
    const updatedModules = [...course.modules];
    updatedModules[mIdx].lessons[lIdx] = {
      ...l,
      questions: [...(l.questions || []), newQ],
    };
    setCourse({ ...course, modules: updatedModules });
    setActive({
      type: "question",
      moduleIndex: mIdx,
      lessonIndex: lIdx,
      questionIndex: (l.questions || []).length,
    });
  };

  const deleteQuestion = (mIdx: number, lIdx: number, qIdx: number) => {
    const l = course.modules[mIdx].lessons[lIdx];
    const updatedQs = l.questions.filter((_: any, i: number) => i !== qIdx);
    const updatedModules = [...course.modules];
    updatedModules[mIdx].lessons[lIdx] = { ...l, questions: updatedQs };
    setCourse({ ...course, modules: updatedModules });
    setActive({ type: "lesson", moduleIndex: mIdx, lessonIndex: lIdx });
  };

  // Render Sidebar Tree Node
  const renderSidebar = () => {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setActive({ type: "course" })}
          className={`w-full text-left p-3 rounded-lg border text-sm font-semibold transition-all ${
            active.type === "course"
              ? "border-navy bg-navy/5 text-navy shadow-sm"
              : "border-line bg-surface hover:bg-slate-50 text-slate-800"
          }`}
        >
          🎓 Course Settings
        </button>

        <div className="border border-line rounded-xl bg-surface p-3 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Curriculum</span>
            <button
              onClick={addModule}
              className="text-[11px] font-bold text-navy hover:text-navy-700 bg-navy/5 px-2 py-1 rounded"
            >
              + Add Module
            </button>
          </div>

          <div className="space-y-2">
            {course.modules.map((m: any, mIdx: number) => {
              const isModActive = active.type === "module" && active.moduleIndex === mIdx;
              return (
                <div key={m.id || mIdx} className="space-y-1">
                  <div className="flex items-center justify-between gap-1 group">
                    <button
                      onClick={() => setActive({ type: "module", moduleIndex: mIdx })}
                      className={`flex-1 text-left px-2.5 py-1.5 rounded text-xs font-medium truncate transition-colors ${
                        isModActive ? "bg-slate-200 text-slate-800 font-semibold" : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      📁 {m.title || `Module ${mIdx + 1}`}
                    </button>
                    <button
                      onClick={() => deleteModule(mIdx)}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-1"
                      title="Delete Module"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Lessons */}
                  <div className="pl-4 border-l border-line space-y-1 mt-1">
                    {m.lessons.map((l: any, lIdx: number) => {
                      const isLesActive =
                        active.type === "lesson" &&
                        active.moduleIndex === mIdx &&
                        active.lessonIndex === lIdx;
                      return (
                        <div key={l.id || lIdx} className="space-y-1">
                          <div className="flex items-center justify-between gap-1 group">
                            <button
                              onClick={() =>
                                setActive({ type: "lesson", moduleIndex: mIdx, lessonIndex: lIdx })
                              }
                              className={`flex-1 text-left px-2 py-1 rounded text-[11px] truncate transition-colors ${
                                isLesActive
                                  ? "bg-navy-50 text-navy font-semibold"
                                  : "text-slate-600 hover:bg-slate-100"
                              }`}
                            >
                              📄 {l.title || `Lesson ${lIdx + 1}`}
                            </button>
                            <button
                              onClick={() => deleteLesson(mIdx, lIdx)}
                              className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-1"
                              title="Delete Lesson"
                            >
                              <TrashIcon className="h-3 w-3" />
                            </button>
                          </div>

                          {/* Quiz questions if type quiz */}
                          {l.type === "quiz" && isLesActive && (
                            <div className="pl-3 border-l border-navy/20 space-y-1 mt-1">
                              {(l.questions || []).map((q: any, qIdx: number) => {
                                const isQActive =
                                  (active as any).type === "question" &&
                                  (active as any).moduleIndex === mIdx &&
                                  (active as any).lessonIndex === lIdx &&
                                  (active as any).questionIndex === qIdx;
                                return (
                                  <button
                                    key={q.id || qIdx}
                                    onClick={() =>
                                      setActive({
                                        type: "question",
                                        moduleIndex: mIdx,
                                        lessonIndex: lIdx,
                                        questionIndex: qIdx,
                                      })
                                    }
                                    className={`w-full text-left px-2 py-0.5 rounded text-[10px] truncate transition-colors ${
                                      isQActive
                                        ? "text-orange font-bold bg-orange/5"
                                        : "text-slate-500 hover:bg-slate-100"
                                    }`}
                                  >
                                    ❓ Q{qIdx + 1}: {q.prompt}
                                  </button>
                                );
                              })}
                              <button
                                onClick={() => addQuestion(mIdx, lIdx)}
                                className="text-[9px] text-orange hover:text-orange-700 font-semibold px-2 py-0.5"
                              >
                                + Add Q
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <button
                      onClick={() => addLesson(mIdx)}
                      className="text-[10px] text-navy hover:text-navy-700 font-semibold px-2 py-1"
                    >
                      + Add Lesson
                    </button>
                  </div>
                </div>
              );
            })}
            {course.modules.length === 0 && (
              <p className="text-[11px] text-muted text-center py-4">No modules. Click Add Module to start.</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render main edits
  const renderEditorContent = () => {
    if (active.type === "course") {
      return (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-800">Course Base Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Course Slug</label>
              <input
                type="text"
                disabled={!isNew}
                value={course.slug}
                onChange={(e) => setCourse({ ...course, slug: e.target.value })}
                placeholder="e.g. analytical-logic"
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy disabled:bg-slate-50 disabled:text-muted"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={["Numerical Reasoning", "Interview Prep", "Psychometrics"].includes(course.category) ? course.category : "custom"}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "custom") {
                    setCourse({ ...course, category: "" });
                  } else {
                    setCourse({ ...course, category: val });
                  }
                }}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy mb-2"
              >
                {["Numerical Reasoning", "Interview Prep", "Psychometrics"].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="custom">Custom Category...</option>
              </select>
              
              {!["Numerical Reasoning", "Interview Prep", "Psychometrics"].includes(course.category) && (
                <input
                  type="text"
                  value={course.category}
                  onChange={(e) => setCourse({ ...course, category: e.target.value })}
                  placeholder="Type custom category name..."
                  className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
                  required
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Course Title</label>
            <input
              type="text"
              value={course.title}
              onChange={(e) => setCourse({ ...course, title: e.target.value })}
              placeholder="e.g. Analytical Logic Mastery"
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subtitle</label>
            <input
              type="text"
              value={course.subtitle}
              onChange={(e) => setCourse({ ...course, subtitle: e.target.value })}
              placeholder="e.g. Decode arguments and identify fallacies"
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Instructor</label>
              <input
                type="text"
                value={course.instructor}
                onChange={(e) => setCourse({ ...course, instructor: e.target.value })}
                placeholder="e.g. Dr. John Doe"
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cover Gradient</label>
              <select
                value={course.cover}
                onChange={(e) => setCourse({ ...course, cover: e.target.value })}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
              >
                <option value="from-navy to-navy-700">Navy Dark (Default)</option>
                <option value="from-orange to-orange-600">Orange Vibrant</option>
                <option value="from-slate-700 to-slate-900">Slate Charcoal</option>
                <option value="from-brand-green to-emerald-600">Green Emerald</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={4}
              value={course.description}
              onChange={(e) => setCourse({ ...course, description: e.target.value })}
              placeholder="Provide a comprehensive introduction to this course..."
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy resize-y"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Course Price ({currency})
            </label>
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                  {currencySymbol(currency)}
                </span>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={course.price ?? 0}
                  onChange={(e) => setCourse({ ...course, price: Number(e.target.value) || 0 })}
                  placeholder="0"
                  className="w-40 rounded-lg border border-line bg-surface py-2 pl-8 pr-3 text-sm outline-none focus:border-navy"
                />
              </div>
              <span className="text-xs text-muted">Set to 0 for free courses</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assigned Instructor
            </label>
            <select
              value={course.instructorUserId ?? ""}
              disabled={!canEditInstructorAssignment}
              onChange={(e) =>
                setCourse({ ...course, instructorUserId: e.target.value || null })
              }
              className="w-full max-w-sm rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">None assigned</option>
              {instructors.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name} ({i.email})
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-muted">
              Controls which Instructor-role account sees and can edit this course in the admin
              panel. Separate from the "Instructor" text field above, which is just the public
              display name.
            </p>
          </div>
        </div>
      );
    }

    if (active.type === "module") {
      const mIdx = active.moduleIndex;
      const m = course.modules[mIdx];
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-800">Edit Module</h3>
            <button
              onClick={() => deleteModule(mIdx)}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"
            >
              Delete Module
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Friendly ID (e.g., m1)</label>
            <input
              type="text"
              value={m.id || ""}
              onChange={(e) => {
                const updated = [...course.modules];
                updated[mIdx] = { ...m, id: e.target.value };
                setCourse({ ...course, modules: updated });
              }}
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Module Title</label>
            <input
              type="text"
              value={m.title}
              onChange={(e) => {
                const updated = [...course.modules];
                updated[mIdx] = { ...m, title: e.target.value };
                setCourse({ ...course, modules: updated });
              }}
              placeholder="e.g. Logical Structures"
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
            />
          </div>

          <div className="border border-line rounded-xl p-4 bg-surface-muted/30">
            <p className="text-xs font-bold text-slate-800 mb-2">Lessons in this Module</p>
            <div className="space-y-2">
              {m.lessons.map((l: any, lIdx: number) => (
                <div key={l.id || lIdx} className="flex justify-between items-center bg-surface p-2.5 rounded-lg border border-line">
                  <span className="text-xs text-slate-800 font-semibold">{l.title} ({l.type})</span>
                  <button
                    onClick={() => setActive({ type: "lesson", moduleIndex: mIdx, lessonIndex: lIdx })}
                    className="text-[11px] text-navy hover:underline"
                  >
                    Edit Lesson
                  </button>
                </div>
              ))}
              <button
                onClick={() => addLesson(mIdx)}
                className="w-full border border-dashed border-slate-300 rounded-lg py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                + Add Lesson
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (active.type === "lesson") {
      const { moduleIndex: mIdx, lessonIndex: lIdx } = active;
      const l = course.modules[mIdx].lessons[lIdx];
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-800">Edit Lesson</h3>
            <button
              onClick={() => deleteLesson(mIdx, lIdx)}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"
            >
              Delete Lesson
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Friendly ID (e.g. l1)</label>
              <input
                type="text"
                value={l.id || ""}
                onChange={(e) => {
                  const updated = [...course.modules];
                  updated[mIdx].lessons[lIdx] = { ...l, id: e.target.value };
                  setCourse({ ...course, modules: updated });
                }}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Lesson Type</label>
              <select
                value={l.type}
                onChange={(e) => {
                  const updated = [...course.modules];
                  updated[mIdx].lessons[lIdx] = { ...l, type: e.target.value };
                  setCourse({ ...course, modules: updated });
                }}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
              >
                <option value="video">Video</option>
                <option value="reading">Reading</option>
                <option value="quiz">Quiz</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (Min)</label>
              <input
                type="number"
                value={l.duration}
                onChange={(e) => {
                  const updated = [...course.modules];
                  updated[mIdx].lessons[lIdx] = { ...l, duration: Number(e.target.value) };
                  setCourse({ ...course, modules: updated });
                }}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Lesson Title</label>
            <input
              type="text"
              value={l.title}
              onChange={(e) => {
                const updated = [...course.modules];
                updated[mIdx].lessons[lIdx] = { ...l, title: e.target.value };
                setCourse({ ...course, modules: updated });
              }}
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Lesson Content (Each line represents a new paragraph/bullet point)
            </label>
            <textarea
              rows={6}
              value={Array.isArray(l.content) ? l.content.join("\n") : ""}
              onChange={(e) => {
                const lines = e.target.value.split("\n");
                const updated = [...course.modules];
                updated[mIdx].lessons[lIdx] = { ...l, content: lines };
                setCourse({ ...course, modules: updated });
              }}
              placeholder="Line 1 details...&#13;Line 2 details..."
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy resize-y font-mono text-xs"
            />
          </div>

          {l.type === "video" && (
            <div className="rounded-xl border border-line bg-surface-muted/30 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎬</span>
                <span className="text-xs font-bold text-slate-800">Video Source</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Video URL
                </label>
                <input
                  type="url"
                  value={l.videoUrl || ""}
                  onChange={(e) => {
                    const updated = [...course.modules];
                    updated[mIdx].lessons[lIdx] = { ...l, videoUrl: e.target.value };
                    setCourse({ ...course, modules: updated });
                  }}
                  placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                  className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
                />
                <p className="mt-1.5 text-[10px] text-muted leading-relaxed">
                  Paste a YouTube, Vimeo, or direct .mp4 video link. The player will automatically detect the format and embed it for students.
                </p>
              </div>
              {l.videoUrl && (
                <div className="rounded-lg overflow-hidden border border-line bg-black aspect-video">
                  <VideoPreview url={l.videoUrl} />
                </div>
              )}
            </div>
          )}

          {l.type === "quiz" && (
            <div className="border border-line rounded-xl p-4 bg-surface-muted/30">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-slate-800">Quiz Questions</span>
                <button
                  onClick={() => addQuestion(mIdx, lIdx)}
                  className="text-[10px] font-bold text-orange hover:text-orange-700 bg-orange/5 px-2 py-1 rounded"
                >
                  + Add Question
                </button>
              </div>
              <div className="space-y-2">
                {(l.questions || []).map((q: any, qIdx: number) => (
                  <div key={q.id || qIdx} className="flex justify-between items-center bg-surface p-2.5 rounded-lg border border-line">
                    <span className="text-xs text-slate-800 truncate font-semibold">Q{qIdx + 1}: {q.prompt}</span>
                    <button
                      onClick={() =>
                        setActive({
                          type: "question",
                          moduleIndex: mIdx,
                          lessonIndex: lIdx,
                          questionIndex: qIdx,
                        })
                      }
                      className="text-[11px] text-orange hover:underline shrink-0 ml-2"
                    >
                      Edit Q
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (active.type === "question") {
      const { moduleIndex: mIdx, lessonIndex: lIdx, questionIndex: qIdx } = active;
      const q = course.modules[mIdx].lessons[lIdx].questions[qIdx];
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-800">Edit Quiz Question</h3>
            <button
              onClick={() => deleteQuestion(mIdx, lIdx, qIdx)}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"
            >
              Delete Question
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Friendly ID (e.g. q1)</label>
              <input
                type="text"
                value={q.id || ""}
                onChange={(e) => {
                  const updated = [...course.modules];
                  updated[mIdx].lessons[lIdx].questions[qIdx] = { ...q, id: e.target.value };
                  setCourse({ ...course, modules: updated });
                }}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Correct Option ID</label>
              <select
                value={q.correctId}
                onChange={(e) => {
                  const updated = [...course.modules];
                  updated[mIdx].lessons[lIdx].questions[qIdx] = { ...q, correctId: e.target.value };
                  setCourse({ ...course, modules: updated });
                }}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
              >
                <option value="a">A</option>
                <option value="b">B</option>
                <option value="c">C</option>
                <option value="d">D</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Question Prompt</label>
            <input
              type="text"
              value={q.prompt}
              onChange={(e) => {
                const updated = [...course.modules];
                updated[mIdx].lessons[lIdx].questions[qIdx] = { ...q, prompt: e.target.value };
                setCourse({ ...course, modules: updated });
              }}
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
            />
          </div>

          <div className="space-y-2 border border-line rounded-xl p-4 bg-surface-muted/30">
            <span className="text-xs font-bold text-slate-800 block mb-2">Options text</span>
            {q.options.map((opt: any, oIdx: number) => (
              <div key={opt.id} className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 w-5">{opt.id.toUpperCase()}:</span>
                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => {
                    const updatedOpts = [...q.options];
                    updatedOpts[oIdx] = { ...opt, text: e.target.value };
                    const updated = [...course.modules];
                    updated[mIdx].lessons[lIdx].questions[qIdx] = { ...q, options: updatedOpts };
                    setCourse({ ...course, modules: updated });
                  }}
                  className="flex-1 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs outline-none focus:border-navy"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Explanation</label>
            <textarea
              rows={3}
              value={q.explanation}
              onChange={(e) => {
                const updated = [...course.modules];
                updated[mIdx].lessons[lIdx].questions[qIdx] = { ...q, explanation: e.target.value };
                setCourse({ ...course, modules: updated });
              }}
              placeholder="Describe the solution steps so students learn from their mistakes..."
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-navy resize-y"
            />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/courses"
            className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              {isNew ? "Create Course" : `Edit: ${course.title}`}
            </h1>
            <p className="text-xs text-muted">
              {isNew ? "Add a new dynamic course to the workspace" : "Modify settings, modules, lessons and questions"}
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-700 disabled:opacity-55"
        >
          {saving ? "Saving Changes..." : "Save Course"}
        </button>
      </div>

      {/* Editor Body Split Layout */}
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
        {/* Sidebar */}
        {renderSidebar()}

        {/* Edit Form */}
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm min-h-[400px]">
          {renderEditorContent()}
        </div>
      </div>
    </div>
  );
}

/** Converts various video URLs into an embeddable format and renders a preview. */
function VideoPreview({ url }: { url: string }) {
  const embedUrl = getEmbedUrl(url);

  if (!embedUrl) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-slate-400">
        Invalid or unsupported video URL
      </div>
    );
  }

  if (embedUrl.endsWith(".mp4") || embedUrl.includes(".mp4")) {
    return (
      <video
        src={embedUrl}
        controls
        className="w-full h-full object-contain"
      />
    );
  }

  return (
    <iframe
      src={embedUrl}
      className="w-full h-full"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      title="Video preview"
    />
  );
}

/** Converts watch/share URLs into embeddable URLs. */
function getEmbedUrl(url: string): string | null {
  if (!url) return null;

  // YouTube: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
  const ytMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{11})/
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

  // Vimeo: vimeo.com/ID
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  // Direct .mp4 links
  if (url.match(/\.mp4(\?|$)/i)) return url;

  // Already an embed URL
  if (url.includes("youtube.com/embed/") || url.includes("player.vimeo.com/video/")) {
    return url;
  }

  return url; // pass through as-is
}
