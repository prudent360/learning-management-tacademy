import { Skeleton, SkeletonCardGrid } from "@/components/skeletons/Skeleton";

export default function MyCoursesLoading() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-navy px-6 py-3.5">
        <Skeleton className="h-4 w-28" />
      </div>

      <div className="rounded-2xl bg-surface p-5 md:p-6">
        <div className="mb-5 space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-72" />
        </div>
        <SkeletonCardGrid count={6} cols="sm:grid-cols-2 xl:grid-cols-3" />
      </div>
    </div>
  );
}
