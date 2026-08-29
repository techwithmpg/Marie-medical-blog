export default function AdminMediaLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading Media">
      <div className="border-b border-subtle-divider pb-5">
        <div className="h-3 w-28 animate-pulse rounded bg-subtle-field" />
        <div className="mt-3 h-8 w-52 animate-pulse rounded bg-subtle-field" />
        <div className="mt-3 h-4 max-w-xl animate-pulse rounded bg-subtle-field" />
      </div>
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="h-96 animate-pulse rounded-lg border border-subtle-divider bg-paper lg:col-span-8" />
        <div className="h-96 animate-pulse rounded-lg border border-subtle-divider bg-paper lg:col-span-4" />
      </div>
    </div>
  );
}
