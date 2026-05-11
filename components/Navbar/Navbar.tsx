"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: "Contact Us", path: "/contact" },
  ];

  return (
    <header 
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        scrolled ? "py-2" : "py-4"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4">
        {/* Main Bar */}
        <div className="grid grid-cols-3 items-center px-4 md:px-8 py-3 rounded-2xl border border-white/20 shadow-xl backdrop-blur-lg bg-white/80">
          
          {/* LEFT: Mobile Menu Button (Mobile) / Placeholder (Desktop) */}
          <div className="flex items-center">
            <button
              onClick={() => setIsOpen(true)}
              className="md:hidden p-2 hover:bg-zinc-100 rounded-xl transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h8m-8 6h16" />
              </svg>
            </button>
            
            {/* Desktop Logo (Hidden on mobile to allow centering logic) */}
            <Link href="/" className="hidden md:block hover:opacity-70 transition-opacity">
              <Image src="/logo.png" alt="logo" width={100} height={32} className="h-8 w-auto object-contain" />
            </Link>
          </div>

          {/* CENTER: Desktop Nav OR Mobile Logo */}
          <div className="flex justify-center items-center">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  className="text-[10px] font-bold tracking-[0.25em] uppercase text-zinc-500 hover:text-zinc-900 transition-colors relative group"
                >
                  {item.name}
                  <motion.span 
                    className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-zinc-900"
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              ))}
            </nav>

            {/* Mobile Centered Logo */}
            <Link href="/" className="md:hidden">
              <Image src="/logo.png" alt="logo" width={80} height={28} className="h-7 w-auto object-contain" />
            </Link>
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center justify-end gap-1 md:gap-4">
            <Link href="/cart" className="p-2 hover:bg-zinc-100 rounded-xl transition-colors relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </Link>
            
            <Link href="/profile" className="hidden md:flex p-2 hover:bg-zinc-100 rounded-xl transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER (Framer Motion) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] md:hidden"
            />
            
            {/* Sidebar */}
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-[300px] bg-white z-[70] shadow-2xl p-8 md:hidden flex flex-col"
            >
              <div className="flex justify-between items-center mb-12">
                <Image src="/logo.png" alt="logo" width={90} height={30} className="h-6 w-auto" />
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <nav className="flex flex-col gap-6">
                {navItems.map((item, idx) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                  >
                    <Link
                      href={item.path}
                      onClick={() => setIsOpen(false)}
                      className="text-2xl font-medium tracking-tight text-zinc-900 hover:pl-2 transition-all"
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="mt-auto border-t border-zinc-100 pt-6">
                <Link 
                  href="/profile" 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-4 text-zinc-600 hover:text-black transition-colors"
                >
                  <div className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="font-semibold uppercase text-xs tracking-widest">My Account</span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;