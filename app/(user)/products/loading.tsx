export default function ProductsLoading() {
  return (
    <main className="min-h-screen bg-[#fdfdfd] pt-24 pb-20">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div>
            <div className="h-9 w-48 bg-zinc-200 rounded animate-pulse" />
            <div className="h-4 w-60 bg-zinc-100 rounded mt-3 animate-pulse" />
          </div>
          <div className="w-full md:w-96">
            <div className="h-11 w-full bg-zinc-100 rounded-xl animate-pulse" />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          <aside className="w-full lg:w-64 shrink-0">
            <div className="space-y-4">
              <div className="h-6 w-24 bg-zinc-200 rounded animate-pulse" />
              <div className="h-10 w-full bg-zinc-100 rounded-lg animate-pulse" />
              <div className="h-10 w-full bg-zinc-100 rounded-lg animate-pulse" />
              <div className="h-10 w-full bg-zinc-100 rounded-lg animate-pulse" />
              <div className="h-10 w-full bg-zinc-100 rounded-lg animate-pulse" />
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-zinc-100">
              <div className="h-4 w-32 bg-zinc-100 rounded animate-pulse" />
              <div className="h-9 w-40 bg-zinc-100 rounded-lg animate-pulse" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
                  <div className="aspect-[4/3] bg-zinc-200 animate-pulse" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 w-16 bg-zinc-100 rounded animate-pulse" />
                    <div className="h-5 w-3/4 bg-zinc-200 rounded animate-pulse" />
                    <div className="h-4 w-1/4 bg-zinc-100 rounded animate-pulse" />
                    <div className="h-9 w-full bg-zinc-100 rounded-xl animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}