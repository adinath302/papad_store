"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import CartSidebar from "@/components/Cart/CartSidebar";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)userId=([^;]*)/);
    const userId = match?.[1];
    if (!userId) return;
    setIsLoggedIn(true);
    fetch(`/api/auth/user?userId=${encodeURIComponent(userId)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (data.isAdmin) setIsAdmin(true);
      })
      .catch(() => {});
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
          : "bg-white/80 backdrop-blur-sm py-3"
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
                alt="The Papad Co."
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
              onClick={() => setIsCartOpen(true)}
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
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full border-2 border-white" />
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
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-stone-900/30 backdrop-blur-sm z-[60] md:hidden"
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-[300px] bg-white z-[70] shadow-2xl p-8 md:hidden flex flex-col"
            >
              <div className="flex justify-between items-center mb-10">
                <Image
                  src="/logo.png"
                  alt="The Papad Co."
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
                {navItems.map((item, idx) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * idx }}
                  >
                    <Link
                      href={item.path}
                      onClick={() => setIsOpen(false)}
                      className="block py-3 px-2 text-lg font-medium text-stone-800 hover:text-emerald-800 hover:pl-4 transition-all border-b border-stone-100"
                    >
                      {item.name}
                    </Link>
                  </motion.div>
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
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
};

export default Navbar;
