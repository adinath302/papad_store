"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useSiteImages } from "@/lib/useSiteImages";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { getGuestCart, clearGuestCart } from "@/lib/guest-cart";
import { fetchCsrf } from "@/lib/csrf-client";
import { useToast } from "@/components/Toast/ToastProvider";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { getImage } = useSiteImages();

  const mergeGuestCart = async () => {
    const guestItems = getGuestCart();
    if (guestItems.length === 0) return;

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
  };

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.error) {
        toast(data.error, "error");
        setIsLoading(false);
        return;
      }

      await mergeGuestCart();
      const redirect = searchParams.get("redirect") || "/";
      router.push(redirect);
    } catch {
      toast("Something went wrong. Please try again.", "error");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#faf8f5]">
      {/* Left Side: Form */}
      <div className="flex flex-col justify-center items-center px-4 sm:px-8 py-10 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Brand Header */}
          <div className="text-center lg:text-left">
            <Link href="/" className="inline-block mb-8">
              <span className="text-2xl font-serif italic text-stone-900">
                Shivshambho
              </span>
              <span className="block text-[10px] text-amber-600 font-semibold tracking-[0.3em] uppercase -mt-1">
                crafted with tradition
              </span>
            </Link>
            <h1 className="text-3xl md:text-4xl font-serif text-stone-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-stone-500">
              Sign in to continue your order.
            </p>
          </div>

          {/* Inputs */}
          <div className="space-y-4">
            <div className="relative group">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-emerald-700 transition-colors"
                size={20}
              />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full bg-white border border-stone-200 rounded-xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-stone-900"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative group">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-emerald-700 transition-colors"
                size={20}
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full bg-white border border-stone-200 rounded-xl py-4 pl-12 pr-12 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-stone-900"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-emerald-800 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 group transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Signing in...
              </span>
            ) : (
              <>
                Sign In
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
              </>
            )}
          </button>

          <div className="text-center -mt-2">
            <Link
              href="/forgot-password"
              className="text-xs text-stone-400 hover:text-stone-600 underline underline-offset-2"
            >
              Forgot password?
            </Link>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#faf8f5] px-4 text-stone-400 font-semibold">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Button */}
          <button
            onClick={() =>
              toast(
                "Google sign-in coming soon! Sign in with email/password for now.",
                "info",
              )
            }
            className="w-full bg-white border border-stone-200 rounded-xl py-4 font-medium text-stone-700 hover:bg-stone-50 transition-all flex items-center justify-center gap-3"
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
              className="text-sm text-stone-400 hover:text-stone-600 underline underline-offset-2"
            >
              Continue as guest
            </Link>
          </div>

          {/* Footer */}
          <p className="text-center text-stone-500 text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href={`/signup${searchParams.get("redirect") ? `?redirect=${searchParams.get("redirect")}` : ""}`}
              className="text-emerald-800 font-bold hover:underline"
            >
              Create Account
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Side: Visual Section */}
      <div className="hidden lg:block relative overflow-hidden bg-stone-100">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <Image
            src={getImage("login_bg")}
            alt="Handcrafted Spices"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/20" />
        </motion.div>

        <div className="absolute bottom-12 left-12 right-12">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="backdrop-blur-md bg-white/10 p-8 rounded-[2rem] border border-white/20 text-white"
          >
            <p className="text-2xl font-serif italic mb-4">
              &ldquo;Authenticity in every bite, delivered to your doorstep.&rdquo;
            </p>
            <span className="text-sm font-black tracking-widest uppercase">
              Shivshambho Heritage
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
