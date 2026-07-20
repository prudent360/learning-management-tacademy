import { Skeleton } from "@/components/skeletons/Skeleton";

export default function CoursePlayerLoading() {
  return (
    <div className="space-y-6">
      {/* Course header banner */}
      <div className="rounded-xl bg-navy px-5 py-4 md:px-6">
        <Skeleton className="h-3 w-24 bg-white/10" />
        <Skeleton className="mt-2 h-5 w-64" />
        <Skeleton className="mt-1.5 h-3 w-80" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        {/* Lesson content */}
        <div className="min-w-0 space-y-5 rounded-2xl bg-surface p-5 md:p-6">
          <Skeleton className="h-20 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <div className="flex items-center justify-between border-t border-line pt-4">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-36" />
          </div>
        </div>

        {/* Course content sidebar */}
        <aside className="rounded-2xl bg-surface p-4 space-y-3">
          <Skeleton className="h-3 w-32" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg p-2">
              <Skeleton className="h-6 w-6 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-1">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2.5 w-1/3" />
              </div>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
