import { SkeletonHeader, SkeletonListRows } from "@/components/skeletons/Skeleton";

export default function AdminCoursesLoading() {
  return (
    <div className="space-y-6">
      <SkeletonHeader withAction />
      <div className="rounded-2xl border border-line bg-surface p-6">
        <SkeletonListRows count={6} />
      </div>
    </div>
  );
}
