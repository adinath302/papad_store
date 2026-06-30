import Link from "next/link";
import { Mail, MapPin, Phone, Headphones, ShieldCheck, Truck } from "lucide-react";

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

const TwitterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.2-18 11.6 7.2.1 13.2-4.5 13.2-4.5-5.1-.1-8.6-3.9-8.6-3.9 1.8.1 3.2-.2 3.2-.2-5.4-1.1-7.8-5.3-7.8-5.3 1.3.6 2.9.8 2.9.8-5.2-4.6-1.5-10.4-1.5-10.4 4.1 4.6 10.5 7.2 16 7.2 0-3.5 2.5-6.3 6-6.3 1.6 0 3.1.7 4.1 1.8 1.4-.3 2.8-.8 2.8-.8-1 1.3-2 2.2-2.8 2.7 1.4-.2 2.7-.6 2.7-.6z"/></svg>
);

const trustBadges = [
  { icon: Headphones, label: "Customer Support" },
  { icon: Truck, label: "Pan-India Shipping" },
  { icon: ShieldCheck, label: "Secure Payments" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-stone-900 text-stone-400 overflow-hidden">
      {/* Trust strip */}
      <div className="border-b border-white/5 bg-emerald-950/50">
        <div className="max-w-7xl mx-auto px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {trustBadges.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center justify-center gap-2.5 text-stone-300">
              <Icon size={18} className="text-amber-400" strokeWidth={1.5} />
              <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-16 pb-10">
        <div className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-none select-none">
          <h2 className="text-[18vw] font-bold text-white/[0.02] leading-none tracking-tight select-none">Shivshambho</h2>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="space-y-5">
              <h3 className="text-xl font-serif text-white">Shivshambho</h3>
              <p className="text-xs text-amber-500 font-semibold tracking-widest uppercase -mt-3">
                Crafted with tradition
              </p>
              <p className="text-sm leading-relaxed max-w-xs text-stone-400">
                Handcrafted papads, kurdai, and traditional Indian snacks made with authentic family recipes since 1984.
              </p>
              <div className="flex gap-3">
                <SocialIcon icon={<InstagramIcon />} href="#" />
                <SocialIcon icon={<FacebookIcon />} href="#" />
                <SocialIcon icon={<TwitterIcon />} href="#" />
              </div>
            </div>

            <div className="space-y-5">
              <h4 className="text-white font-bold tracking-wider text-xs uppercase">Quick Links</h4>
              <ul className="space-y-3 text-sm">
                <li><FooterLink href="/products">Shop All</FooterLink></li>
                <li><FooterLink href="/products">Our Varieties</FooterLink></li>
                <li><FooterLink href="/about">About Us</FooterLink></li>
                <li><FooterLink href="/faq">FAQ</FooterLink></li>
                <li><FooterLink href="/">Our Heritage</FooterLink></li>
                <li><FooterLink href="/contact">Track Order</FooterLink></li>
              </ul>
            </div>

            <div className="space-y-5">
              <h4 className="text-white font-bold tracking-wider text-xs uppercase">Contact</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <span>Nordhan branch, sangamner road, ward no 7, maharashtra, India</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={16} className="text-amber-500 shrink-0" />
                  <span>+91 78229 01803</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={16} className="text-amber-500 shrink-0" />
                  <span>adinathgaware23072003@gmail.com</span>
                </li>
              </ul>
            </div>

            <div className="space-y-5">
              <h4 className="text-white font-bold tracking-wider text-xs uppercase">Policies</h4>
              <ul className="space-y-3 text-sm">
                <li><FooterLink href="/track">Track Order</FooterLink></li>
                <li><FooterLink href="/returns">Returns Policy</FooterLink></li>
                <li><FooterLink href="/shipping-policy">Shipping Policy</FooterLink></li>
                <li><FooterLink href="/wishlist">My Wishlist</FooterLink></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] tracking-[0.15em] uppercase font-semibold text-stone-500 text-center md:text-left">
            <p>© {currentYear} Shivshambho. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/returns" className="hover:text-white transition-colors">Returns Policy</Link>
              <Link href="/shipping-policy" className="hover:text-white transition-colors">Shipping Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ icon, href }: { icon: React.ReactNode; href: string }) {
  return (
    <a href={href} className="w-9 h-9 rounded-full border border-stone-700 flex items-center justify-center text-stone-400 hover:text-white hover:border-amber-500 hover:bg-amber-500/10 transition-all duration-300">
      {icon}
    </a>
  );
}

function FooterLink({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-2 hover:text-white transition-colors">
      <span className="w-0 h-px bg-amber-500 group-hover:w-3 transition-all duration-300" />
      {children}
    </Link>
  );
}
