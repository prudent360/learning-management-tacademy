import { StudyPlannerView } from "@/components/StudyPlannerView";
import { getStudyPlan } from "@/app/actions/goals";

export default async function StudyPlannerPage() {
  const items = await getStudyPlan();
  return <StudyPlannerView items={items} />;
}
