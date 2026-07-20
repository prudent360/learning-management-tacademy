import {
  QuizIcon,
  DashboardIcon,
  AptitudeIcon,
  ProgramIcon,
  CoursesIcon,
  BookIcon,
} from "@/components/icons";

export type AptitudeCategory = {
  name: string;
  description: string;
  questions: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  icon: typeof QuizIcon;
};

export const aptitudeCategories: AptitudeCategory[] = [
  {
    name: "Critical Thinking",
    description: "Evaluate arguments, assumptions and conclusions under time pressure.",
    questions: 20,
    difficulty: "Advanced",
    icon: QuizIcon,
  },
  {
    name: "Spatial Reasoning",
    description: "Rotate, fold and manipulate shapes to spot the correct pattern.",
    questions: 18,
    difficulty: "Intermediate",
    icon: DashboardIcon,
  },
  {
    name: "Three Digit Reasoning",
    description: "Fast mental arithmetic and number-sequence recognition.",
    questions: 25,
    difficulty: "Beginner",
    icon: AptitudeIcon,
  },
  {
    name: "Mechanical Reasoning",
    description: "Apply everyday physics — levers, gears, pulleys and forces.",
    questions: 16,
    difficulty: "Intermediate",
    icon: ProgramIcon,
  },
  {
    name: "Numerical Reasoning",
    description: "Ratios, percentages and data interpretation from tables and charts.",
    questions: 22,
    difficulty: "Intermediate",
    icon: CoursesIcon,
  },
  {
    name: "Verbal Reasoning",
    description: "Draw logical conclusions from written passages — true, false or cannot say.",
    questions: 20,
    difficulty: "Beginner",
    icon: BookIcon,
  },
];
