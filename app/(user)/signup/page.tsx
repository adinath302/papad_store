"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useSiteImages } from "@/lib/useSiteImages";
import { Mail, Lock, User, Eye, EyeOff, UserPlus, Check } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { getGuestCart, clearGuestCart } from "@/lib/guest-cart";
import { fetchCsrf } from "@/lib/csrf-client";
import { useToast } from "@/components/Toast/ToastProvider";

export const dynamic = "force-dynamic";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const { toast } = useToast();
  const { getImage } = useSiteImages();

  const handleSignup = async () => {
    setError("");

    if (!name.trim()) { setError("Please enter your full name"); return; }
    if (!email.trim()) { setError("Please enter your email address"); return; }
    if (!password.trim()) { setError("Please create a password"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (!agreeTerms) { setError("Please agree to the terms & conditions"); return; }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setIsLoading(false);
        return;
      }

      const guestItems = getGuestCart();
      if (guestItems.length > 0) {
        const results = await Promise.allSettled(
          guestItems.map((item) =>
            fetchCsrf("/api/cart", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
              }),
            }),
          ),
        );
        const allSucceeded = results.every((r) => r.status === "fulfilled" && r.value.ok);
        if (allSucceeded) clearGuestCart();
      }

      const redirect = searchParams.get("redirect") || "/";
      router.push(redirect);
    } catch {
      setError("Registration failed. Please check your connection.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#faf8f5]">
      {/* Left Side: Visual Section */}
      <div className="hidden lg:block relative overflow-hidden bg-stone-100">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <Image
            src={getImage("signup_bg")}
            alt="Handmade Tradition"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/50 to-black/20" />
        </motion.div>

        <div className="absolute top-12 left-12">
          <span className="text-2xl font-serif italic text-white">
            Shivshambho
          </span>
          <span className="block text-[10px] text-amber-400 font-semibold tracking-[0.3em] uppercase">
            crafted with tradition
          </span>
        </div>

        <div className="absolute bottom-12 left-12 right-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="backdrop-blur-xl bg-white/10 p-10 rounded-[2.5rem] border border-white/20 text-white"
          >
            <h2 className="text-4xl font-serif mb-4 leading-tight">
              You&apos;re one bite away from belonging.
            </h2>
            <p className="text-zinc-200 leading-relaxed font-light text-sm">
              Join Shivshambho Club and unlock members-only batches,
              early access to seasonal drops, and stories from the heart
              of Indian kitchens.
            </p>
            <div className="mt-6 flex items-center gap-4 text-xs text-zinc-300">
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-emerald-400" /> Exclusive Flavors
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-emerald-400" /> Early Access
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-emerald-400" /> Family Recipes
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex flex-col justify-center items-center px-6 sm:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-7"
        >
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-serif text-stone-900 mb-2">
              Sign Up
            </h1>
            <p className="text-stone-500 text-sm">
              Create your account and step into a world of authentic crunch.
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-4">
            {/* Name Input */}
            <div className="relative group">
              <User
                className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-emerald-700 transition-colors pointer-events-none"
                size={18}
              />
              <input
                type="text"
                placeholder="Full name"
                className="w-full bg-white border border-stone-200 rounded-xl py-3.5 pl-11 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-stone-900 text-sm placeholder:text-stone-400"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Email Input */}
            <div className="relative group">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-emerald-700 transition-colors pointer-events-none"
                size={18}
              />
              <input
                type="email"
                placeholder="Email address"
                className="w-full bg-white border border-stone-200 rounded-xl py-3.5 pl-11 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-stone-900 text-sm placeholder:text-stone-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password Input */}
            <div className="relative group">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-emerald-700 transition-colors pointer-events-none"
                size={18}
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create password"
                className="w-full bg-white border border-stone-200 rounded-xl py-3.5 pl-11 pr-11 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-stone-900 text-sm placeholder:text-stone-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Terms agreement */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 accent-emerald-800 w-4 h-4 rounded border-stone-300 cursor-pointer"
            />
            <span className="text-xs text-stone-500 group-hover:text-stone-700 transition-colors leading-relaxed">
              I agree to the{" "}
              <span className="text-emerald-800 font-medium hover:underline cursor-pointer">Terms of Service</span>
              {" "}and{" "}
              <span className="text-emerald-800 font-medium hover:underline cursor-pointer">Privacy Policy</span>
            </span>
          </label>

          <button
            onClick={handleSignup}
            disabled={isLoading}
            className="w-full bg-emerald-800 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 group transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm tracking-wide cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Creating account...
              </span>
            ) : (
              <>
                Sign Up
                <UserPlus className="group-hover:translate-x-1 transition-transform" size={18} />
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#faf8f5] px-4 text-stone-400 font-semibold tracking-wider">
                Or sign up with
              </span>
            </div>
          </div>

          {/* Google Button */}
          <button
            onClick={() =>
              toast(
                "Google sign-up coming soon! Sign up with email for now.",
                "info",
              )
            }
            className="w-full bg-white border border-stone-200 rounded-xl py-3.5 font-medium text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition-all flex items-center justify-center gap-3 text-sm cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          {/* Guest option */}
          <div className="text-center">
            <Link
              href={searchParams.get("redirect") || "/products"}
              className="text-sm text-stone-400 hover:text-stone-600 underline underline-offset-2 transition-colors"
            >
              Browse as guest
            </Link>
          </div>

          <p className="text-center text-stone-500 text-sm">
            Already a member?{" "}
            <Link
              href={`/login${searchParams.get("redirect") ? `?redirect=${searchParams.get("redirect")}` : ""}`}
              className="text-emerald-800 font-bold hover:text-emerald-700 hover:underline transition-colors"
            >
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
