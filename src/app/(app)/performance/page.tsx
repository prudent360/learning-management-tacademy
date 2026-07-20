import { ExamPerformanceView } from "@/components/ExamPerformanceView";
import { getExamPerformance } from "@/app/actions/exam-performance";

export default async function PerformancePage() {
  const data = await getExamPerformance();
  return <ExamPerformanceView data={data} />;
}
