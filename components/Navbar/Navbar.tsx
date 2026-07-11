"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartCount } from "@/lib/cart-context";
import { useSiteImages } from "@/lib/useSiteImages";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

const Navbar = ({ onCartToggle }: { onCartToggle?: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const cartCount = useCartCount();
  const { getImage } = useSiteImages();

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const loggedIn = getCookie("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);

    const cached = sessionStorage.getItem("nav_auth");
    if (cached) {
      try {
        const data = JSON.parse(cached);
        if (data.isAdmin) setIsAdmin(true);
      } catch {}
    }
    if (loggedIn) {
      const controller = new AbortController();
      fetch("/api/auth/me", { signal: controller.signal })
        .then((r) => r.json())
        .then((data) => {
          const isAdminUser = data.user?.isAdmin === true;
          setIsAdmin(isAdminUser);
          setIsLoggedIn(true);
          sessionStorage.setItem(
            "nav_auth",
            JSON.stringify({ isAdmin: isAdminUser }),
          );
        })
        .catch(() => {});
      return () => controller.abort();
    }
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact Us" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-lg shadow-sm border-b border-stone-200/60"
          : "bg-white border-b border-stone-100"
      }`}
    >
      <nav className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex items-center justify-between h-[80px]">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 -ml-2 rounded-xl hover:bg-stone-100 transition-colors"
            aria-label="Toggle menu"
          >
            <div className="w-5 h-4 relative flex flex-col justify-between">
              <span
                className={`block h-0.5 bg-stone-700 rounded-full transition-all ${isOpen ? "rotate-45 translate-y-[7px]" : ""}`}
              />
              <span
                className={`block h-0.5 bg-stone-700 rounded-full transition-all ${isOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`block h-0.5 bg-stone-700 rounded-full transition-all ${isOpen ? "-rotate-45 -translate-y-[7px]" : ""}`}
              />
            </div>
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <Image
              src={getImage("logo")}
              alt="Shivshambho"
              width={100}
              height={100}
              className="w-[100px] h-[100px] object-contain rounded-lg"
              priority
            />
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3.5 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-xl transition-all"
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                className="px-3.5 py-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition-all"
              >
                Admin
              </Link>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onCartToggle}
              className="relative p-2.5 rounded-xl hover:bg-stone-100 transition-colors"
              aria-label="Open cart"
            >
              <svg
                className="w-5 h-5 text-stone-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-emerald-700 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>
            {isLoggedIn ? (
              <Link
                href="/profile"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-all"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
                My Account
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-stone-100 bg-white/95 backdrop-blur-lg">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50 rounded-xl transition-all"
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all"
              >
                Admin
              </Link>
            )}
            <hr className="my-3 border-stone-100" />
            {isLoggedIn ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-stone-900 bg-stone-100 rounded-xl"
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
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                  My Account
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50 rounded-xl transition-all"
                >
                  My Orders
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 text-sm font-semibold text-stone-900 bg-stone-100 rounded-xl text-center"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
