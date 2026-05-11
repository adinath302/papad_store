export default function Loading() {
  return (
    <div className="w-full pt-28 px-4 max-w-7xl mx-auto animate-pulse">
      {/* Carousel Skeleton */}
      <div className="h-[450px] md:h-[600px] w-full bg-zinc-200 rounded-[2rem]" />
      
      {/* Grid Skeleton */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-96 bg-zinc-100 rounded-[2rem]" />
        ))}
      </div>
    </div>
  );
}