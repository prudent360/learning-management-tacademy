export type LessonType = "video" | "reading" | "quiz";

export type QuizOption = { id: string; text: string };

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: QuizOption[];
  correctId: string;
  explanation: string;
};

export type Lesson = {
  id: string;
  dbId?: string;
  title: string;
  type: LessonType;
  /** Duration in minutes. */
  duration: number;
  /** Short paragraphs of lesson body copy (rendered as text blocks). */
  content: string[];
  /** YouTube/Vimeo embed URL or direct video link. Only for `video` lessons. */
  videoUrl?: string;
  /** Only present on `quiz` lessons. */
  questions?: QuizQuestion[];
};

export type Module = {
  id: string;
  title: string;
  lessons: Lesson[];
};

export type Course = {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  instructor: string;
  /** Real account assignment for instructor-scoped admin views; `instructor` above stays the free-text display name. */
  instructorUserId?: string | null;
  /** Tailwind gradient classes used for the cover banner. */
  cover: string;
  description: string;
  /** Price in minor currency units. 0 = free. */
  price: number;
  modules: Module[];
};



export function allLessons(course: Course): Lesson[] {
  return course.modules.flatMap((m) => m.lessons);
}

export function lessonCount(course: Course): number {
  return course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
}

export function courseMinutes(course: Course): number {
  return allLessons(course).reduce((sum, l) => sum + l.duration, 0);
}
