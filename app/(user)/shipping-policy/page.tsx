import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Policy | Shivshambho",
  description: "Our shipping policy covering delivery timelines, charges, and coverage areas across India.",
};

export default function ShippingPolicyPage() {
  return (
    <main className="min-h-screen bg-[#faf8f5] pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-serif text-stone-900 mb-2">Shipping Policy</h1>
        <p className="text-stone-400 text-sm mb-10">Last updated: June 2026</p>

        <div className="space-y-8 text-stone-600 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">1. Shipping Coverage</h2>
            <p>We currently ship to all locations across India. We do not offer international shipping at this time.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">2. Delivery Timeline</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Maharashtra:</strong> 2–4 business days</li>
              <li><strong>Metro Cities:</strong> 2–3 business days</li>
              <li><strong>Rest of India:</strong> 3–6 business days</li>
              <li>Orders are processed within 24 hours of placement (excluding Sundays and public holidays)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">3. Shipping Charges</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Free shipping</strong> on all orders above ₹599</li>
              <li><strong>Maharashtra:</strong> Flat ₹50 shipping for orders below ₹599</li>
              <li><strong>Rest of India:</strong> Flat ₹100 shipping for orders below ₹599</li>
              <li>Shipping costs are calculated based on total order weight and delivery pincode</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">4. Shipping Partners</h2>
            <p>We use India Post Speed Post for all deliveries. Tracking details will be shared via email once your order is dispatched.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">5. Order Tracking</h2>
            <p>Once your order is shipped, you will receive an email with the courier name and tracking number. You can use this tracking number to track your shipment on the respective courier partner&apos;s website.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">6. Delivery Issues</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>If a package is returned to us due to an incorrect address provided by you, a re-shipping fee may apply</li>
              <li>If you are unavailable at the time of delivery, the courier partner will attempt re-delivery</li>
              <li>For any delivery concerns, contact us at hello@papadcompany.com</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">7. Contact</h2>
            <p>For shipping-related queries, reach out to us at hello@papadcompany.com or call +91 98765 43210.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
