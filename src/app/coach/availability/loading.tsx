import { Skeleton } from "@/components/skeletons/Skeleton";

export default function CoachAvailabilityLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-3 w-80" />
      </div>
      <div className="rounded-2xl border border-line bg-surface p-5 md:p-6">
        <Skeleton className="mb-4 h-4 w-40" />
        <Skeleton className="h-10 w-full max-w-md" />
      </div>
      <div className="rounded-2xl border border-line bg-surface p-5 md:p-6">
        <Skeleton className="mb-4 h-4 w-36" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}
