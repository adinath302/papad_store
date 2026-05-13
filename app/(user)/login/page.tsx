"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
        alert(data.error);
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#fdfdfd]">
      
      {/* Left Side: Form */}
      <div className="flex flex-col justify-center items-center px-8 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Brand Header */}
          <div className="text-center lg:text-left">
            <Link href="/" className="inline-block mb-8">
               <span className="text-2xl font-serif italic text-zinc-900">The Papad Co.</span>
            </Link>
            <h1 className="text-4xl font-serif text-zinc-900 mb-2">Welcome Back</h1>
            <p className="text-zinc-500">Please enter your details to access your account.</p>
          </div>

          {/* Inputs */}
          <div className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-amber-600 transition-colors" size={20} />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-zinc-900"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-amber-600 transition-colors" size={20} />
              <input
                type="password"
                placeholder="Password"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-zinc-900"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end">
              <button className="text-sm font-medium text-amber-600 hover:text-amber-700">
                Forgot password?
              </button>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 group transition-all disabled:opacity-50 shadow-xl shadow-zinc-200"
          >
            {isLoading ? "Signing in..." : "Sign In"}
            {!isLoading && <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />}
          </button>

          {/* Footer */}
          <p className="text-center text-zinc-500 text-sm">
            Don't have an account?{" "}
            <Link href="/signup" className="text-zinc-900 font-bold hover:underline">
              Join the club
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Side: Visual Section (Hidden on Mobile) */}
      <div className="hidden lg:block relative overflow-hidden bg-zinc-100">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <img 
            src="https://images.unsplash.com/photo-1614707267537-b85acc00c4b7?q=80&w=1200" 
            alt="Handcrafted Spices"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </motion.div>

        {/* Floating Quote */}
        <div className="absolute bottom-12 left-12 right-12">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="backdrop-blur-md bg-white/10 p-8 rounded-[2rem] border border-white/20 text-white"
          >
            <p className="text-2xl font-serif italic mb-4">
              "Authenticity in every bite, delivered to your doorstep."
            </p>
            <span className="text-sm font-black tracking-widest uppercase">
              The Papad Co. Heritage
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}