import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 text-6xl">📡</div>
      <h1 className="mb-2 text-2xl font-semibold text-gray-800">
        You&apos;re Offline
      </h1>
      <p className="mb-6 max-w-md text-gray-600">
        Check your internet connection and try again. Previously viewed pages
        are available even offline.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-emerald-700 px-6 py-3 text-white transition hover:bg-emerald-800"
      >
        Go Home
      </Link>
    </div>
  );
}
