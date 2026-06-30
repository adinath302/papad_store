import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | Papad Store",
  description:
    "Frequently asked questions about Papad Store products, ordering, shipping, and returns.",
};

const faqs = [
  {
    q: "What makes your papads different?",
    a: "Every batch is handmade, sun-dried, and contains absolutely no preservatives or artificial additives. Our recipes have been perfected over four decades, giving you that authentic homemade taste.",
  },
  {
    q: "How should I store papads?",
    a: "Store them in an airtight container in a cool, dry place away from moisture. Properly stored, they stay fresh for up to 6 months.",
  },
  {
    q: "Do you ship across India?",
    a: "Yes, we ship pan-India via trusted courier partners. No location is too far — we deliver to every pincode across the country.",
  },
  {
    q: "Is there a minimum order value?",
    a: "There is no minimum order value. You can order as little or as much as you like. Free shipping is applicable on orders above ₹499.",
  },
  {
    q: "How do I roast or fry papads?",
    a: "You can roast them directly over a gas flame (turning frequently for even puffing), microwave for 30–40 seconds, or deep-fry in hot oil for a crispier texture. They puff up beautifully with any method.",
  },
  {
    q: "Can I place bulk orders?",
    a: "Absolutely! We welcome bulk orders for events, restaurants, and wholesale. Contact us at hello@papadcompany.com for custom pricing and quantity discounts.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major payment methods via Razorpay — credit/debit cards, UPI (GPay, PhonePe, Paytm), net banking, and Cash on Delivery (COD) for select locations.",
  },
  {
    q: "How long does delivery take?",
    a: "Metro cities: 3–5 business days. Other locations: 5–10 business days. Orders are dispatched within 24 hours of placement (excluding Sundays and public holidays).",
  },
  {
    q: "Can I cancel my order?",
    a: "Yes, you can cancel your order if the status is PENDING. Visit your Orders page and click Cancel. Once an order is processed or shipped, cancellations are not possible.",
  },
  {
    q: "Do you offer refunds?",
    a: "If your order arrives damaged or there is an issue, we will make it right — whether through a replacement or a full refund. Just send us a photo within 48 hours of delivery and we will take care of it.",
  },
];

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-[#faf8f5] pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-serif text-stone-900 mb-2 text-center">
          Frequently Asked Questions
        </h1>
        <p className="text-stone-400 text-sm mb-10 text-center">
          Everything you need to know about Shivshambho papads
        </p>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="group bg-white rounded-2xl border border-stone-200 overflow-hidden"
              {...(i === 0 ? { open: true } : {})}
            >
              <summary className="flex items-center justify-between px-6 py-4 cursor-pointer text-stone-900 font-semibold text-sm md:text-base hover:bg-stone-50 transition-colors list-none">
                {faq.q}
                <svg
                  className="w-5 h-5 text-stone-400 shrink-0 ml-4 transition-transform duration-200 group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 pb-4 text-stone-500 text-sm leading-relaxed">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </main>
  );
}
