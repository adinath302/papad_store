import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Shivshambho",
  description: "Our terms and conditions for using Shivshambho website and services.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#faf8f5] pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-serif text-stone-900 mb-2">Terms of Service</h1>
        <p className="text-stone-400 text-sm mb-10">Last updated: June 2026</p>

        <div className="space-y-8 text-stone-600 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Shivshambho website, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">2. Products & Pricing</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>All prices are in Indian Rupees (INR) and inclusive of applicable taxes</li>
              <li>Product images are for illustration; actual products may vary slightly</li>
              <li>We reserve the right to modify prices and discontinue products without prior notice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">3. Orders & Payment</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Orders are confirmed only after payment verification (for online payments) or order placement (for COD)</li>
              <li>We reserve the right to cancel any order due to stock unavailability or payment issues</li>
              <li>Cash on Delivery orders may be subject to verification</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">4. Shipping & Delivery</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>We ship across India via trusted courier partners</li>
              <li>Standard delivery takes 5–7 business days</li>
              <li>Shipping is free on all orders</li>
              <li>Risk of loss passes to you upon delivery</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">5. Returns & Refunds</h2>
            <p>Due to the perishable nature of food products, we cannot accept returns. If you receive a damaged or defective product, please contact us within 48 hours of delivery with photographic evidence for a resolution.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">6. Account Responsibility</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">7. Contact</h2>
            <p>For any questions regarding these terms, contact us at hello@papadcompany.com or call +91 98765 43210.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
