export default function AdminLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading workspace">
      <div className="border-b border-subtle-divider pb-5">
        <div className="h-8 w-52 animate-pulse rounded bg-subtle-field motion-reduce:animate-none" />
        <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-subtle-field motion-reduce:animate-none" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-lg border border-subtle-divider bg-paper motion-reduce:animate-none"
          />
        ))}
      </div>
      <span className="sr-only">Loading workspace content…</span>
    </div>
  );
}
