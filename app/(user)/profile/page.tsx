"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)userId=([^;]*)/);
    const loggedIn = Boolean(match?.[1]);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoggedIn(loggedIn);
    if (!loggedIn) return;

    const userId = match?.[1];
    if (!userId) return;

    // Best-effort fetch for user details.
    // If your auth/session endpoints differ, this will silently fall back.
    fetch(`/api/auth/user?userId=${encodeURIComponent(userId)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed"))))
      .then((data) => {
        setUserName(data?.name ?? null);
        setUserEmail(data?.email ?? null);
      })
      .catch(() => {
        setUserName(null);
        setUserEmail(null);
      });
  }, []);

  return (
    <div className="min-h-[60vh] pt-24 pb-16 px-6 bg-[#faf8f5]">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-serif text-stone-900">Your Account</h1>
        <p className="text-stone-500 mt-2">
          {isLoggedIn ? "Manage your orders and account details." : "Sign in to view your orders and checkout faster."}
        </p>

        {isLoggedIn && (userName || userEmail) && (
          <div className="mt-6 rounded-2xl bg-white border border-stone-200 p-4 shadow-sm">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-emerald-800">
              Logged in
            </p>
            <div className="mt-2 space-y-1 text-stone-700">
              {userName && <p className="font-semibold">{userName}</p>}
              {userEmail && <p className="text-sm text-stone-500">{userEmail}</p>}
            </div>
          </div>
        )}

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl bg-white border border-stone-200 p-7 shadow-sm">
            <h2 className="text-lg font-bold text-stone-900">Account</h2>
            <p className="text-stone-500 mt-2 text-sm">
              {isLoggedIn
                ? "You’re logged in. Continue to view your orders."
                : "Login to view your orders and checkout faster."}
            </p>

            {!isLoggedIn ? (
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/login"
                  className="flex-1 text-center px-6 py-3.5 rounded-full bg-zinc-900 text-white font-bold hover:bg-zinc-800 transition"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="flex-1 text-center px-6 py-3.5 rounded-full bg-white text-zinc-900 font-bold border border-stone-200 hover:bg-stone-50 transition"
                >
                  New Account
                </Link>
              </div>
            ) : (
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/orders"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-zinc-900 text-white font-bold hover:bg-zinc-800 transition"
                >
                  View Orders
                </Link>
                <Link
                  href="/signup"
                  className="flex-1 inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-white text-zinc-900 font-bold border border-stone-200 hover:bg-stone-50 transition"
                >
                  New Account
                </Link>
                <Link
                  href="/login"
                  className="flex-1 inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-stone-100 text-stone-900 font-bold border border-stone-200 hover:bg-stone-200 transition"
                >
                  Logout
                </Link>
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-white border border-stone-200 p-7 shadow-sm">
            <h2 className="text-lg font-bold text-stone-900">Quick Links</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link href="/products" className="text-amber-700 hover:underline">
                  Shop Products
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-amber-700 hover:underline">
                  Your Cart
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-amber-700 hover:underline">
                  Orders
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

