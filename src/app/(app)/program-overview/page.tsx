import { ProgramOverviewView } from "@/components/ProgramOverviewView";
import { getCourses } from "@/lib/courses-server";

export default async function ProgramOverviewPage() {
  const courses = await getCourses();
  return <ProgramOverviewView courses={courses} />;
}
