"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, Loader2, Zap } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", json.token);
      localStorage.setItem("name", json.name);
      router.push("/");
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc] relative overflow-hidden font-sans p-4">
      {/* --- Background --- */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-150 h-150 bg-blue-100 rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] right-[-5%] w-125 h-125 bg-orange-100 rounded-full blur-[100px] opacity-60" />
      </div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl shadow-orange-200 rounded-[2.5rem] p-8 sm:p-10 relative">
        {/* Header */}
        <div className="text-center mb-10 ">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-bold tracking-wider mb-4 border border-orange-100">
            <Zap size={12} fill="currentColor" /> WELCOME BACK
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Login</h2>
          <p className="text-gray-500 mt-2 text-sm">
            Please enter your details to continue.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 ml-3 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors group-focus-within:text-orange-500" />
              <input
                className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                type="email"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 ml-3 uppercase tracking-wider">
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors group-focus-within:text-orange-500" />
              <input
                type="password"
                className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-gray-900/20 active:scale-[0.98] flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Login <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Don’t have an account?{" "}
            <a
              href="/signup"
              className="text-orange-600 font-bold hover:text-orange-700 hover:underline transition-all"
            >
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
