import { getMyCoachAvailability } from "@/app/actions/coaches";
import { CoachAvailabilityEditor } from "@/components/CoachAvailabilityEditor";

export default async function CoachAvailabilityPage() {
  const slots = await getMyCoachAvailability();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-slate-800">Availability</h1>
        <p className="text-sm text-muted">
          Pick the weekly time slots students can book with you. Changes apply going forward.
        </p>
      </div>

      <CoachAvailabilityEditor initialSlots={slots} />
    </div>
  );
}
