"use client";

import { useState, Suspense } from "react";
import { Lock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Shimmer from "@/components/Skeleton/Skeleton";

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setDone(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-medium">Invalid reset link.</p>
        <Link href="/forgot-password" className="text-emerald-800 font-bold hover:underline text-sm mt-2 inline-block">
          Request a new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center space-y-4">
        <CheckCircle size={48} className="mx-auto text-emerald-600" />
        <h2 className="text-xl font-serif text-stone-900">Password Reset!</h2>
        <p className="text-stone-500 text-sm">You can now sign in with your new password.</p>
        <Link href="/login" className="inline-block bg-emerald-800 text-white font-bold py-3 px-6 rounded-xl hover:bg-emerald-700 transition-all text-sm">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="relative group">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-emerald-700 transition-colors" size={20} />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New Password (min 6 chars)"
          className="w-full bg-white border border-stone-200 rounded-xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-stone-900"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-emerald-800 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
      >
        {loading ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg> : "Reset Password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-6">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-3xl font-serif text-stone-900">Set New Password</h1>
          <p className="text-stone-500 text-sm mt-1">Enter your new password below.</p>
        </div>

        <Suspense fallback={<div className="space-y-4 py-12 max-w-sm mx-auto"><Shimmer className="h-5 w-48 mx-auto" /><Shimmer className="h-14 w-full" /><Shimmer className="h-14 w-full" /></div>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
