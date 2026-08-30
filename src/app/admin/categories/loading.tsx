export default function AdminCategoriesLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading Categories">
      <div className="border-b border-subtle-divider pb-5">
        <div className="h-3 w-36 animate-pulse rounded bg-subtle-field" />
        <div className="mt-3 h-8 w-64 animate-pulse rounded bg-subtle-field" />
        <div className="mt-3 h-4 max-w-xl animate-pulse rounded bg-subtle-field" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)]">
        <div className="h-96 animate-pulse rounded-lg border border-subtle-divider bg-paper" />
        <div className="h-80 animate-pulse rounded-lg border border-subtle-divider bg-paper" />
      </div>
    </div>
  );
}
