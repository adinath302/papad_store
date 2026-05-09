import Link from "next/link";
import Navigation from "./Navigation";
import Image from "next/image";

const Navbar = () => {
  return (
    <header className="sticky top-0 h-full w-full bg-white-900 border-b border-white/5 shadow-2xl">
      {/* Using a very dark zinc background with a subtle, dark amber bottom border */}
      <div className="flex items-center justify-between px-8 py-2  mx-auto max-w-7xl">
        {/* 1. Logo Section (Royal/Elegant Typography) */}
        <div className="flex items-center flex-shrink-0">
          <Link
            href="/"
            className="text-2xl font-serif tracking-widest text-white uppercase"
          >
            <Image
              src="/logo3.png"
              alt="logo"
              width={120}
              height={120}
              className="text-white"
            />
          </Link>
        </div>

        {/* 2. Routes */}
        <div className="hidden md:flex flex-1 justify-center">
          <Navigation />
        </div>

        {/* 3. Actions: Cart & Profile (Delicate Icons) */}
        <div className="flex items-center space-x-6">
          {/* Cart Button */}
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative text-zinc-800 transition-colors duration-300 hover:text-amber-400 group"
          >
            {/* Note the strokeWidth={1.5} for a more refined, delicate look */}
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </Link>

          {/* Profile Button */}
          <Link
            href="/profile"
            aria-label="Profile"
            className="text-zinc-800 transition-colors duration-300 hover:text-amber-400"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
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
    </header>
  );
};

export default Navbar;
