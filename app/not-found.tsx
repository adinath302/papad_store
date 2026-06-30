import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-8xl font-serif text-stone-200 mb-4">404</div>
        <h1 className="text-2xl font-serif text-stone-900 mb-3">
          Page not found
        </h1>
        <p className="text-stone-500 text-sm mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been
          moved. Let&apos;s get you back on track.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-stone-800 transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
