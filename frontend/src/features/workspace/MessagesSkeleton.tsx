export default function MessagesSkeleton() {
  return (
    <div className="space-y-6 p-4" aria-hidden>
      <div className="ml-auto h-16 w-3/4 animate-pulse rounded-2xl bg-surface" />
      <div className="flex gap-3">
        <div className="h-7 w-7 animate-pulse rounded-md bg-surface" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-surface" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-surface" />
        </div>
      </div>
    </div>
  );
}
