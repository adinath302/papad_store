"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, UserPlus } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
      } else {
        alert("Account created successfully! Please login.");
        window.location.href = "/login";
      }
    } catch (err) {
      alert("Registration failed. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#fdfdfd]">
      
      {/* Left Side: Visual Section (Hidden on Mobile) */}
      <div className="hidden lg:block relative overflow-hidden bg-zinc-100 border-r border-zinc-100">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          {/* A high-end heritage image (sun-drying papads or lentils) */}
          <img 
            src="https://images.unsplash.com/photo-1589113817223-14db18136244?q=80&w=1200" 
            alt="Handmade Tradition"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
        </motion.div>

        <div className="absolute top-12 left-12">
           <span className="text-2xl font-serif italic text-white">The Papad Co.</span>
        </div>

        <div className="absolute bottom-12 left-12 right-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="backdrop-blur-lg bg-black/20 p-10 rounded-[2.5rem] border border-white/20 text-white"
          >
            <h2 className="text-3xl font-serif mb-4">Join our tradition.</h2>
            <p className="text-zinc-200 leading-relaxed font-light">
              Become a member of The Papad Co. and get exclusive access to 
              limited-batch flavors, traditional recipes, and heritage stories.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex flex-col justify-center items-center px-8 py-12">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-serif text-zinc-900 mb-2">Create Account</h1>
            <p className="text-zinc-500">Start your journey into authentic Indian flavors.</p>
          </div>

          <div className="space-y-4">
            {/* Name Input */}
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-amber-600 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Full Name"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-zinc-900"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Email Input */}
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

            {/* Password Input */}
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-amber-600 transition-colors" size={20} />
              <input
                type="password"
                placeholder="Create Password"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-zinc-900"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={handleSignup}
            disabled={isLoading}
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 group transition-all disabled:opacity-50 shadow-xl shadow-zinc-200"
          >
            {isLoading ? "Creating account..." : "Join the Club"}
            {!isLoading && <UserPlus className="group-hover:translate-x-1 transition-transform" size={18} />}
          </button>

          <p className="text-center text-zinc-500 text-sm">
            Already a member?{" "}
            <Link href="/login" className="text-zinc-900 font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}