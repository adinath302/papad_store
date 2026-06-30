"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-7xl font-serif text-stone-200 mb-6">!</div>
        <h1 className="text-2xl font-serif text-stone-900 mb-3">
          Something went wrong
        </h1>
        <p className="text-stone-500 text-sm mb-8 leading-relaxed">
          We encountered an unexpected error. Please try again or contact us if
          the problem persists.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="px-6 py-3 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-stone-800 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-white text-stone-900 rounded-xl text-sm font-bold border border-stone-200 hover:bg-stone-50 transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
