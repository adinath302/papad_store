import type { Metadata } from "next";
import { Phone, Mail, MapPin, Headphones } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Us | Papad Store",
  description: "Get in touch with Papad Store. We'd love to hear from you.",
};

const contactDetails = [
  {
    label: "Phone",
    value: "+91 78229 01803",
    href: "tel:+917822901803",
    description: "Available Mon–Sat, 10 AM – 7 PM",
  },
  {
    label: "Email",
    value: "adinathgaware23072003@gmail.com",
    href: "mailto:adinathgaware23072003@gmail.com",
    description: "We reply within 24 hours",
  },
  {
    label: "Office",
    value: "Nordhan branch, sangamner road, ward no 7, maharashtra, India",
    href: "https://maps.app.goo.gl/BCwKdfB5vpKHSmC38",
    description: "Visit us by appointment",
  },
];

const faqs = [
  {
    q: "How do I track my order?",
    a: "Once your order ships, you'll receive a tracking link via email. You can also check your order status under your profile.",
  },
  {
    q: "What is your return policy?",
    a: "We want you to love every bite. If anything is amiss, reach out within 7 days and we'll make it right.",
  },
  {
    q: "Do you ship internationally?",
    a: "Currently we ship across India. International shipping is coming soon — stay tuned!",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-28 pb-16 bg-[#faf8f5]">
      {/* Header */}
      <div className="text-center px-6 mb-14">
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-emerald-700 mb-4 animate-fade-in">
          Get in Touch
        </p>
        <h1 className="text-4xl md:text-5xl font-serif text-stone-900 mb-4 animate-fade-in [animation-delay:80ms]">
          We&apos;d love to hear from you
        </h1>
        <p className="text-stone-500 max-w-lg mx-auto text-sm leading-relaxed animate-fade-in [animation-delay:150ms]">
          Whether you have a question about our papads, need help with an order,
          or just want to say namaste — we&apos;re here for you.
        </p>
      </div>

      {/* Contact Cards */}
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
        {contactDetails.map((item, i) => {
          const Icon =
            item.label === "Phone"
              ? Phone
              : item.label === "Email"
                ? Mail
                : MapPin;
          return (
            <a
              key={item.label}
              href={item.href}
              target={item.label === "Office" ? "_blank" : undefined}
              rel={item.label === "Office" ? "noopener noreferrer" : undefined}
              className="group bg-white border border-stone-200 rounded-2xl p-6 hover:border-emerald-200 hover:shadow-md transition-all animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 mb-4 group-hover:bg-emerald-800 group-hover:text-white transition-all">
                <Icon size={20} />
              </div>
              <h3 className="text-sm font-bold tracking-wider uppercase text-stone-500 mb-1">
                {item.label}
              </h3>
              <p className="text-stone-900 font-semibold text-sm mb-1">
                {item.value}
              </p>
              <p className="text-stone-400 text-xs">{item.description}</p>
            </a>
          );
        })}
      </div>

      {/* Support Section */}
      <div className="max-w-3xl mx-auto px-6 mb-16">
        <div className="bg-gradient-to-br from-emerald-900 to-stone-900 rounded-3xl p-8 md:p-10 text-white text-center">
          <Headphones size={32} className="mx-auto mb-4 text-amber-400" />
          <h2 className="text-2xl font-serif mb-2">Need help right now?</h2>
          <p className="text-stone-300 text-sm max-w-md mx-auto mb-6">
            Call or WhatsApp us — we personally handle every inquiry. No bots,
            no waiting.
          </p>
          <a
            href="tel:+917822901803"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold py-3.5 px-8 rounded-full transition-all text-sm tracking-wide"
          >
            <Phone size={16} />
            +91 78229 01803
          </a>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-2xl font-serif text-stone-900 text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="group bg-white border border-stone-200 rounded-xl overflow-hidden"
            >
              <summary className="px-6 py-4 font-semibold text-stone-800 text-sm cursor-pointer hover:bg-stone-50 transition-colors list-none flex items-center justify-between gap-4">
                {faq.q}
                <svg
                  className="w-4 h-4 shrink-0 text-stone-400 group-open:rotate-180 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <div className="px-6 pb-4 text-sm text-stone-500 leading-relaxed border-t border-stone-100 pt-3">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Back to shop */}
      <div className="text-center mt-12">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 hover:text-emerald-700 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Shop
        </Link>
      </div>
    </div>
  );
}
