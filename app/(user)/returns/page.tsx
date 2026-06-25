import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Returns Policy | Shivshambho",
  description: "Our 7-day return and refund policy for damaged or defective products.",
};

export default function ReturnsPage() {
  return (
    <main className="min-h-screen bg-[#faf8f5] pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-serif text-stone-900 mb-2">Returns Policy</h1>
        <p className="text-stone-400 text-sm mb-10">Last updated: June 2026</p>

        <div className="space-y-8 text-stone-600 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">1. Perishable Goods Policy</h2>
            <p>Due to the perishable nature of our food products, we generally cannot accept returns or exchanges. However, if you receive a damaged, defective, or incorrect product, we will make it right.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">2. 7-Day Return Window</h2>
            <p>You must report any issue within <strong>7 days</strong> of delivery. Requests after 7 days will not be eligible for resolution.</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Report must include your order number and photographic evidence</li>
              <li>Email photos showing the damage or defect to hello@papadcompany.com</li>
              <li>We will review and respond within 48 hours</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">3. Eligible Issues</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Damaged package</strong> — Visible physical damage to the product or packaging</li>
              <li><strong>Defective product</strong> — Quality issues like spoilage, mold, or contamination</li>
              <li><strong>Wrong item</strong> — You received a product different from what you ordered</li>
              <li><strong>Missing items</strong> — Partial delivery with items missing from your order</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">4. Resolution Options</h2>
            <p>Depending on the issue, we will offer one of the following:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Full refund</strong> — Refund to original payment method (5–7 business days for processing)</li>
              <li><strong>Replacement</strong> — A fresh batch shipped at no extra cost</li>
              <li><strong>Store credit</strong> — Credit added to your account for future purchases</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">5. Non-Returnable Items</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Products reported after the 7-day window</li>
              <li>Items damaged due to improper storage after delivery</li>
              <li>Products where the seal is broken or partially consumed</li>
              <li>Free promotional items or samples</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">6. COD Orders</h2>
            <p>For Cash on Delivery orders, refunds will be processed via bank transfer. Please provide your bank account details (account number, IFSC code) when submitting a return request.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900 mb-3">7. Contact Us</h2>
            <p>For any return-related queries, contact us at:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Email: hello@papadcompany.com</li>
              <li>Phone: +91 98765 43210</li>
              <li>Please include your order number in all communications</li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
