import { getMyResume } from "@/app/actions/resume";
import { ResumeBuilderForm } from "@/components/ResumeBuilderForm";

export default async function CvBuilderPage() {
  const resume = await getMyResume();
  return <ResumeBuilderForm resume={resume} />;
}
