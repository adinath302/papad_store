import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us | Shivshambho",
};

const values = [
  {
    title: "Quality",
    desc: "Every papad is crafted with handpicked ingredients, ensuring consistent texture and taste in every bite.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Tradition",
    desc: "Our recipes have been passed down through generations, preserving the authentic taste of Maharashtra.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    title: "Authenticity",
    desc: "No preservatives, no artificial flavours — just pure, sun-dried papads made the traditional way.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
  },
  {
    title: "Customer Love",
    desc: "Your satisfaction drives us. Every order is packed with care and delivered with a smile.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
  },
];

const processSteps = [
  { label: "Dough", icon: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" },
  { label: "Roll", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
  { label: "Sun-dry", icon: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" },
  { label: "Pack", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#faf8f5]">
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 text-center max-w-3xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-serif text-stone-900 mb-4 leading-tight">
          Our Story
        </h1>
        <p className="text-lg text-stone-500 max-w-2xl mx-auto">
          Crafting authentic Maharashtrian papads with tradition and love since 1984.
        </p>
      </section>

      {/* Heritage */}
      <section className="pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-serif text-stone-900 mb-6 text-center">Our Heritage</h2>
          <div className="bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-stone-200">
            <p className="text-stone-600 leading-relaxed text-base md:text-lg">
              Shivshambho was born in the heart of Maharashtra, where every kitchen tells a story of
              flavour passed down through generations. What started as a small family recipe in 1984 has
              grown into a brand trusted by thousands across India. Our papads are made the same way
              they always have been — by hand, with love, using sun-drying techniques that preserve the
              authentic taste of traditional Maharashtrian cuisine. Every bite carries the warmth of home.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-serif text-stone-900 mb-10 text-center">What We Stand For</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                  {v.icon}
                </div>
                <h3 className="text-xl font-serif text-stone-900 mb-2">{v.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-serif text-stone-900 mb-10 text-center">How We Make Them</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {processSteps.map((step, i) => (
              <div key={step.label} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 text-center">
                <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={step.icon} />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-stone-700 block">Step {i + 1}</span>
                <span className="text-lg font-serif text-stone-900">{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20 px-6 text-center">
        <div className="max-w-xl mx-auto bg-emerald-700 rounded-2xl p-10 shadow-lg">
          <h2 className="text-3xl font-serif text-white mb-3">Taste the Tradition</h2>
          <p className="text-emerald-100 mb-6">
            Explore our range of handcrafted papads and bring home the authentic taste of Maharashtra.
          </p>
          <Link
            href="/products"
            className="inline-block bg-white text-emerald-800 font-semibold px-8 py-3 rounded-xl hover:bg-emerald-50 transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </section>
    </main>
  );
}
