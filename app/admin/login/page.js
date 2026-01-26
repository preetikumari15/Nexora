"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function submit() {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const json = await res.json();
    if (!res.ok) {
      alert(json.error || "Login failed");
      return;
    }

    localStorage.setItem("adminToken", json.token);
    router.push("/admin/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-6 rounded shadow w-96 space-y-3">
        <h2 className="text-xl font-bold text-center">Admin Login</h2>

        <input
          className="border p-2 w-full"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="border p-2 w-full"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="bg-black text-white w-full py-2 rounded"
          onClick={submit}
        >
          Login
        </button>
      </div>
    </div>
  );
}
