import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Shivshambho",
  description: "Our privacy policy explains how we collect, use, and protect your personal information.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#faf8f5] pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-serif text-stone-900 mb-2">Privacy Policy</h1>
        <p className="text-stone-400 text-sm mb-10">Last updated: June 2026</p>

        <div className="space-y-8 text-stone-600 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">1. Information We Collect</h2>
            <p>When you place an order or create an account on Shivshambho, we collect:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Your name, email address, phone number</li>
              <li>Shipping address and billing details</li>
              <li>Order history and preferences</li>
              <li>Payment information (processed securely via Razorpay — we never store card details)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To process and fulfill your orders</li>
              <li>To communicate order updates and support requests</li>
              <li>To improve our products and website experience</li>
              <li>To send promotional offers (only with your consent)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">3. Data Protection</h2>
            <p>We implement industry-standard security measures to protect your personal data. All transactions are encrypted via SSL. Payment data is handled directly by Razorpay, a PCI-DSS compliant payment gateway.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">4. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Razorpay</strong> — Payment processing</li>
              <li><strong>Cloudinary</strong> — Image hosting and delivery</li>
              <li><strong>Google Analytics</strong> — Website analytics (optional, see cookie preferences)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">5. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data at any time. Contact us at hello@papadcompany.com for any data-related requests.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">6. Contact</h2>
            <p>For questions about this policy, reach out to us at hello@papadcompany.com or call +91 98765 43210.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
