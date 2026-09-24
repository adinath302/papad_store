export default function Loading() {
  return (
    <div className="min-h-screen bg-[#faf8f5] pt-24 px-4 md:px-8">
      <div className="mx-auto max-w-7xl animate-pulse space-y-8">
        <div className="h-[40vh] md:h-[70vh] rounded-none bg-stone-200" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-stone-200" />
          ))}
        </div>
      </div>
    </div>
  );
}
