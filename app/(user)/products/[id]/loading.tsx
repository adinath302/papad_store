export default function ProductDetailLoading() {
  return (
    <main className="min-h-screen bg-[#faf8f5] pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Breadcrumb */}
        <div className="h-4 w-48 bg-zinc-200 rounded animate-pulse mb-8" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
          {/* Image skeleton */}
          <div className="aspect-[4/3] bg-zinc-200 rounded-2xl animate-pulse" />

          {/* Details skeleton */}
          <div className="space-y-6">
            <div>
              <div className="h-3 w-20 bg-zinc-200 rounded animate-pulse mb-2" />
              <div className="h-8 w-3/4 bg-zinc-200 rounded animate-pulse mb-3" />
              <div className="h-4 w-full bg-zinc-100 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-zinc-100 rounded animate-pulse mt-1" />
            </div>

            <div className="h-px w-full bg-zinc-200" />

            <div className="h-8 w-24 bg-zinc-200 rounded animate-pulse" />

            <div className="space-y-2">
              <div className="h-3 w-16 bg-zinc-200 rounded animate-pulse" />
              <div className="flex gap-2">
                <div className="h-10 w-14 bg-zinc-100 rounded-lg animate-pulse" />
                <div className="h-10 w-14 bg-zinc-100 rounded-lg animate-pulse" />
                <div className="h-10 w-14 bg-zinc-100 rounded-lg animate-pulse" />
              </div>
            </div>

            <div className="h-12 w-full bg-zinc-200 rounded-xl animate-pulse" />

            <div className="space-y-2">
              <div className="h-4 w-full bg-zinc-100 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-zinc-100 rounded animate-pulse" />
              <div className="h-4 w-4/6 bg-zinc-100 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Tabs skeleton */}
        <div className="space-y-6">
          <div className="flex gap-6 border-b border-zinc-200 pb-2">
            <div className="h-6 w-20 bg-zinc-200 rounded animate-pulse" />
            <div className="h-6 w-24 bg-zinc-200 rounded animate-pulse" />
            <div className="h-6 w-16 bg-zinc-200 rounded animate-pulse" />
          </div>
          <div className="space-y-3">
            <div className="h-4 w-full bg-zinc-100 rounded animate-pulse" />
            <div className="h-4 w-full bg-zinc-100 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-zinc-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </main>
  );
}