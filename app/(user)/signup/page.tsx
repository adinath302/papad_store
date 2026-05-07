"use client";

import { useState } from "react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const data = await res.json();

    console.log(data);

    if (data.error) {
      alert(data.error);
    } else {
      alert("Signup successful");
    }
  };

  return (
    <div className="p-5 flex flex-col gap-3 max-w-sm">
      <h1 className="text-2xl font-bold">Signup</h1>

      <input
        type="text"
        placeholder="Name"
        className="border p-2"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="email"
        placeholder="Email"
        className="border p-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="border p-2"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleSignup}
        className="bg-black text-white p-2"
      >
        Signup
      </button>
    </div>
  );
}