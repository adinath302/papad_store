"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 px-8 py-3 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-stone-800 transition-all"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 5V2h8v3" />
        <rect x="2.5" y="7.5" width="11" height="6" rx="1" />
        <path d="M11.5 10h1" />
      </svg>
      Print / Save PDF
    </button>
  );
}
