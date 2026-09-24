export default function ProductsLoading() {
  return (
    <main className="min-h-screen bg-[#fdfdfd] pt-24 pb-20">
      <div className="max-w-[1400px] mx-auto px-6 animate-pulse">
        <div className="h-10 w-64 bg-stone-200 rounded mb-12" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-2xl bg-stone-200" />
          ))}
        </div>
      </div>
    </main>
  );
}
