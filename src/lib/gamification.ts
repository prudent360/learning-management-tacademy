export const XP_PER_LEVEL = 500;
export const levelFromXP = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1;

export type Badge = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

export const BADGES: Badge[] = [
  {
    id: "first-step",
    title: "First Step",
    description: "Completed your first learning lesson.",
    icon: "🎯",
  },
  {
    id: "streak-3",
    title: "Streak Starter",
    description: "Maintained a 3-day learning streak.",
    icon: "🔥",
  },
  {
    id: "exam-champ",
    title: "Exam Champ",
    description: "Scored 80% or higher on a practice exam.",
    icon: "🏆",
  },
  {
    id: "course-master",
    title: "Course Master",
    description: "Completed 100% of any study course.",
    icon: "🎓",
  },
];
