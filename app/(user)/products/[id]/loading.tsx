export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-[#faf8f5] pt-24 px-4 md:px-8">
      <div className="mx-auto max-w-6xl animate-pulse grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-square rounded-2xl bg-stone-200" />
        <div className="space-y-4 pt-4">
          <div className="h-8 w-3/4 bg-stone-200 rounded" />
          <div className="h-5 w-1/3 bg-stone-200 rounded" />
          <div className="h-24 w-full bg-stone-200 rounded" />
          <div className="h-12 w-48 bg-stone-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
