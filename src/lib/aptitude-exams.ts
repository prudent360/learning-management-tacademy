export type ExamQuestion = {
  id: string;
  prompt: string;
  options: { id: string; text: string }[];
  correctId: string;
  explanation: string;
};

export type PracticeExam = {
  categorySlug: string;
  categoryName: string;
  durationMinutes: number;
  questions: ExamQuestion[];
};


