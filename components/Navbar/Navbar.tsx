"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartCount } from "@/lib/cart-context";


const Navbar = ({ onCartToggle }: { onCartToggle?: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const cartCount = useCartCount();

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
    const cached = sessionStorage.getItem("nav_auth");
    if (cached) {
      try {
        const data = JSON.parse(cached);
        if (data.isAdmin) setIsAdmin(true);
        return;
      } catch {}
    }
    const controller = new AbortController();
    fetch("/api/auth/me", { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        const isAdminUser = data.user?.isAdmin === true;
        setIsAdmin(isAdminUser);
        sessionStorage.setItem("nav_auth", JSON.stringify({ isAdmin: isAdminUser }));
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: "Contact Us", path: "/contact" },
  ];

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-stone-200/80 py-2"
          : "bg-white/95 backdrop-blur-sm py-3"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Left: mobile menu + desktop logo */}
          <div className="flex items-center gap-3 min-w-[120px]">
            <button
              onClick={() => setIsOpen(true)}
              className="md:hidden p-2 hover:bg-stone-100 rounded-xl transition-colors text-stone-700"
              aria-label="Open menu"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <Link
              href="/"
              className="hover:opacity-80 transition-opacity"
            >
              <Image
                src="/logo.png"
                alt="Shivshambho"
                width={110}
                height={36}
                className="h-7 md:h-8 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Center: desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className="text-xs font-semibold tracking-wide uppercase text-stone-600 hover:text-emerald-800 transition-colors relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </nav>

          {/* Right: actions */}
          <div className="flex items-center justify-end gap-1 md:gap-2 min-w-[120px]">
            <button
              onClick={onCartToggle}
              className="p-2.5 hover:bg-stone-100 rounded-xl transition-colors relative text-stone-700"
              aria-label="Open cart"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-bold leading-none min-w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-white px-1">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>

            {isAdmin && (
              <Link
                href="/admin"
                className="hidden md:flex p-2.5 hover:bg-amber-50 rounded-xl transition-colors text-amber-700"
                aria-label="Admin panel"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </Link>
            )}

            <Link
              href="/profile"
              className="hidden md:flex p-2.5 hover:bg-stone-100 rounded-xl transition-colors text-stone-700"
              aria-label="My account"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {isOpen && (
        <>
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[60] md:hidden"
            style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
          />

          <div
            className="fixed inset-y-0 left-0 w-[300px] z-[70] shadow-2xl md:hidden flex flex-col"
            style={{ backgroundColor: "#ffffff" }}
          >
            <div className="p-8 flex flex-col min-h-0 flex-1">
              <div className="flex justify-between items-center mb-10">
                <Image
                  src="/logo.png"
                  alt="Shivshambho"
                  width={90}
                  height={30}
                  className="h-6 w-auto"
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-stone-100 rounded-full"
                  aria-label="Close menu"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <nav className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.path}
                    onClick={() => setIsOpen(false)}
                    className="block py-3 px-2 text-lg font-medium text-stone-800 hover:text-emerald-800 hover:pl-4 transition-all border-b border-stone-100"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto border-t border-stone-100 pt-6 space-y-3">
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 text-amber-700 hover:text-amber-800 transition-colors"
                  >
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <span className="font-semibold text-xs uppercase tracking-wider">
                      Admin Panel
                    </span>
                  </Link>
                )}
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 text-stone-600 hover:text-emerald-800 transition-colors"
                >
                  <div className="w-10 h-10 bg-emerald-800 rounded-full flex items-center justify-center text-white">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-xs uppercase tracking-wider">
                    My Account
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Navbar;
