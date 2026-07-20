export function PageLoading({ fullScreen = false }: { fullScreen?: boolean }) {
  return (
    <div
      className={`flex items-center justify-center ${fullScreen ? "min-h-screen" : "min-h-[50vh]"}`}
      role="status"
      aria-label="Loading"
    >
      <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-navy-50 border-t-navy" />
    </div>
  );
}
