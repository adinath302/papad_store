type SkeletonProps = {
  className?: string;
};

function Shimmer({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`relative overflow-hidden bg-stone-200/70 rounded-xl ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_ease-in-out_infinite]">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
      </div>
    </div>
  );
}

export function SkeletonCard({ className = "" }: SkeletonProps) {
  return (
    <div className={`bg-white rounded-2xl border border-stone-200/80 overflow-hidden ${className}`}>
      <Shimmer className="aspect-square rounded-none" />
      <div className="p-4 space-y-3">
        <Shimmer className="h-3 w-1/4" />
        <Shimmer className="h-4 w-3/4" />
        <Shimmer className="h-3 w-1/2" />
        <div className="flex gap-2 pt-2">
          <Shimmer className="h-9 flex-1" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonProductPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 pt-28 pb-20">
      <Shimmer className="h-4 w-48 mb-8" />
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
        <Shimmer className="aspect-square rounded-3xl" />
        <div className="space-y-6">
          <Shimmer className="h-4 w-32" />
          <Shimmer className="h-10 w-3/4" />
          <Shimmer className="h-4 w-1/2" />
          <Shimmer className="h-12 w-40" />
          <Shimmer className="h-20 w-full" />
          <div className="flex gap-3 pt-4">
            <Shimmer className="h-14 w-36" />
            <Shimmer className="h-14 flex-1" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="min-h-screen pt-28 pb-16 px-6 bg-[#faf8f5]">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Shimmer className="w-14 h-14 rounded-full" />
          <div className="space-y-2">
            <Shimmer className="h-6 w-48" />
            <Shimmer className="h-4 w-32" />
          </div>
        </div>
        <Shimmer className="h-10 w-full mb-6" />
        <Shimmer className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonCart() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 pt-28 pb-16">
      <Shimmer className="h-8 w-32 mb-8" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 items-center">
            <Shimmer className="w-24 h-28 rounded-2xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Shimmer className="h-4 w-3/4" />
              <Shimmer className="h-3 w-1/3" />
              <Shimmer className="h-4 w-20" />
            </div>
            <Shimmer className="w-8 h-8 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonCheckout() {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 pt-28 pb-16">
      <Shimmer className="h-4 w-24 mb-8" />
      <Shimmer className="h-9 w-48 mb-10" />
      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-4">
          <Shimmer className="h-96 w-full rounded-xl" />
        </div>
        <div className="lg:col-span-2">
          <Shimmer className="h-80 w-full rounded-xl sticky top-28" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonOrders() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 pt-28 pb-16">
      <Shimmer className="h-8 w-48 mb-8" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Shimmer key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function SkeletonOrderConfirmation() {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-28 pb-16 text-center">
      <Shimmer className="w-20 h-20 rounded-full mx-auto mb-6" />
      <Shimmer className="h-8 w-64 mx-auto mb-3" />
      <Shimmer className="h-4 w-48 mx-auto mb-10" />
      <Shimmer className="h-48 w-full rounded-xl mb-6" />
      <Shimmer className="h-40 w-full rounded-xl mb-6" />
      <Shimmer className="h-12 w-48 mx-auto rounded-xl" />
    </div>
  );
}

export function SkeletonAdminDashboard() {
  return (
    <div className="flex-1 p-6 md:p-10">
      <Shimmer className="h-8 w-48 mb-8" />
      <div className="grid sm:grid-cols-3 gap-6 mb-10">
        {[1, 2, 3].map((i) => (
          <Shimmer key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <Shimmer className="h-8 w-40 mb-4" />
      <Shimmer className="h-64 w-full rounded-xl" />
    </div>
  );
}

export function SkeletonAddresses() {
  return (
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <Shimmer key={i} className="h-28 w-full rounded-xl" />
      ))}
    </div>
  );
}

export function SkeletonButton({ className = "" }: SkeletonProps) {
  return <Shimmer className={`h-11 w-full rounded-xl ${className}`} />;
}

export function SkeletonText({
  lines = 3,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Shimmer
          key={i}
          className={`h-3 ${i === lines - 1 ? "w-2/3" : "w-full"}`}
        />
      ))}
    </div>
  );
}

export function SkeletonPage() {
  return (
    <div className="w-full pt-28 px-4 max-w-7xl mx-auto">
      {/* Hero */}
      <Shimmer className="h-[450px] md:h-[600px] w-full rounded-[2rem]" />
      {/* Grid */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <Shimmer key={i} className="h-96 rounded-[2rem]" />
        ))}
      </div>
      {/* Text section */}
      <div className="mt-24 space-y-4 max-w-3xl mx-auto">
        <Shimmer className="h-6 w-1/3 mx-auto" />
        <Shimmer className="h-4 w-2/3 mx-auto" />
        <Shimmer className="h-4 w-1/2 mx-auto" />
      </div>
    </div>
  );
}

export default Shimmer;
