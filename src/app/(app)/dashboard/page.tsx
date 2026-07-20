import { DashboardView } from "@/components/DashboardView";
import { getCourses } from "@/lib/courses-server";
import { getStudyPlan } from "@/app/actions/goals";

export default async function DashboardPage() {
  const [courses, studyPlan] = await Promise.all([getCourses(), getStudyPlan()]);
  return <DashboardView courses={courses} studyPlan={studyPlan} />;
}
