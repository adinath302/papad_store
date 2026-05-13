"use client";
import { Mail, MapPin, Phone, ExternalLink } from "lucide-react";

// Custom SVG Brand Icons since Lucide removed them
const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

const TwitterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.2-18 11.6 7.2.1 13.2-4.5 13.2-4.5-5.1-.1-8.6-3.9-8.6-3.9 1.8.1 3.2-.2 3.2-.2-5.4-1.1-7.8-5.3-7.8-5.3 1.3.6 2.9.8 2.9.8-5.2-4.6-1.5-10.4-1.5-10.4 4.1 4.6 10.5 7.2 16 7.2 0-3.5 2.5-6.3 6-6.3 1.6 0 3.1.7 4.1 1.8 1.4-.3 2.8-.8 2.8-.8-1 1.3-2 2.2-2.8 2.7 1.4-.2 2.7-.6 2.7-.6z"/></svg>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-zinc-900 text-zinc-400 pt-24 pb-12 overflow-hidden mt-20">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">
        <h2 className="text-[25vw] font-black text-white/[0.02] leading-none">PAPAD</h2>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div className="space-y-6">
            <h3 className="text-2xl font-serif text-white italic">The Papad Co.</h3>
            <p className="text-sm leading-relaxed max-w-xs">
              Preserving the authentic taste of Indian heritage since 1984. 
              Hand-crafted with love, sun-dried to perfection.
            </p>
            <div className="flex gap-5">
              <SocialIcon icon={<InstagramIcon />} href="#" />
              <SocialIcon icon={<FacebookIcon />} href="#" />
              <SocialIcon icon={<TwitterIcon />} href="#" />
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-white font-bold tracking-widest text-xs uppercase">Quick Links</h4>
            <ul className="space-y-4 text-sm">
              <li><FooterLink href="#">Our Varieties</FooterLink></li>
              <li><FooterLink href="#">The Heritage</FooterLink></li>
              <li><FooterLink href="#">Wholesale Inquiry</FooterLink></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-white font-bold tracking-widest text-xs uppercase">Get in Touch</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-amber-500 shrink-0" />
                <span>123 Spice Route, Heritage Lane, Rajasthan, India</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-amber-500 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-amber-500 shrink-0" />
                <span>hello@papadcompany.com</span>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-white font-bold tracking-widest text-xs uppercase">Join the Club</h4>
            <p className="text-sm">Get recipes and early access to new flavors.</p>
            <div className="relative">
              <input 
                type="email" 
                placeholder="Email Address" 
                className="w-full bg-zinc-800 border-none rounded-full py-4 px-6 text-sm text-white focus:ring-2 focus:ring-amber-500 transition-all outline-none"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-amber-500 hover:bg-amber-600 text-white p-2.5 rounded-full transition-colors">
                <ExternalLink size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] tracking-[0.2em] uppercase font-bold text-center md:text-left">
          <p>© {currentYear} THE PAPAD COMPANY. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ icon, href }: { icon: React.ReactNode; href: string }) {
  return (
    <a href={href} className="w-10 h-10 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:border-amber-500 hover:bg-amber-500 transition-all duration-300">
      {icon}
    </a>
  );
}

function FooterLink({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <a href={href} className="group flex items-center gap-2 hover:text-white transition-colors">
      <span className="w-0 h-[1px] bg-amber-500 group-hover:w-4 transition-all duration-300" />
      {children}
    </a>
  );
}