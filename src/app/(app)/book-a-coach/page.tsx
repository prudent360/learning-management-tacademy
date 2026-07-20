import { BookACoachView } from "@/components/BookACoachView";
import { listCoaches } from "@/app/actions/coaches";

export default async function BookACoachPage() {
  const coaches = await listCoaches();
  return <BookACoachView coaches={coaches.filter((c) => c.bookable)} />;
}
