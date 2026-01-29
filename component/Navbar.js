"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, LogOut, User, Menu } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const name = localStorage.getItem("name");
      const token = localStorage.getItem("token");
      if (token && name) {
        setUser({ name });
      }
    }
  }, []);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("adminToken");
    setUser(null);
    router.push("/");
  }

  return (
    <div className="fixed top-0 left-0 w-full z-50 px-2 py-3 sm:px-4 sm:py-4 flex justify-center pointer-events-none">
      <nav className="pointer-events-auto w-full max-w-6xl bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl shadow-gray-200/40 rounded-full px-4 py-3 sm:px-5 flex items-center justify-between transition-all">
        {/* --- Logo Section --- */}
        <div
          className="font-bold text-xl tracking-tight cursor-pointer flex items-center gap-2 text-gray-900 shrink-0"
          onClick={() => router.push("/")}
        >
          <div className="w-8 h-8 rounded-full bg-linear-to-tr from-orange-400 to-pink-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
            N
          </div>
          {/* Hide the text 'Nexora' on small mobile screens to make room for links */}
          <span className="hidden sm:block">Nexora</span>
        </div>

        {/* --- Right Actions Section --- */}
        {user ? (
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Navigation Links (Visible on Mobile now) */}
            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm font-medium text-gray-700">
              <button
                onClick={() => router.push("/")}
                className="hover:text-black transition-colors whitespace-nowrap"
              >
                Home
              </button>
              <button
                onClick={() => router.push("/trips")}
                className="hover:text-black transition-colors whitespace-nowrap"
              >
                My Trips
              </button>
            </div>

            {/* Divider (Hidden on mobile) */}
            <div className="h-4 w-px bg-gray-300 hidden sm:block"></div>

            {/* Admin Link (Icon only) */}
            <button
              onClick={() => router.push("/admin/login")}
              title="Admin Panel"
              className="p-1.5 sm:p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all shrink-0"
            >
              <Shield size={16} className="sm:w-4.5 sm:h-4.5" />
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2 pl-1.5 pr-1 py-1 bg-gray-100 rounded-full border border-gray-200 shrink-0">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-gray-400 shadow-sm">
                <User size={12} />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-gray-700 mr-1 max-w-15 sm:max-w-25 truncate">
                {user.name}
              </span>
              <button
                onClick={logout}
                className="w-6 h-6 sm:w-7 sm:h-7 bg-white rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                title="Logout"
              >
                <LogOut size={12} className="sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          // --- LOGGED OUT STATE ---
          <div className="flex items-center gap-2 sm:gap-3 text-sm font-medium">
            <button
              onClick={() => router.push("/admin/login")}
              className="hidden sm:flex items-center gap-1 text-gray-400 hover:text-purple-600 transition-colors"
            >
              <Shield size={14} />
              Admin
            </button>

            <div className="h-4 w-px bg-gray-300 mx-1 hidden sm:block"></div>

            <button
              onClick={() => router.push("/login")}
              className="text-gray-600 hover:text-gray-900 px-2 transition-colors text-xs sm:text-sm"
            >
              Login
            </button>

            <button
              onClick={() => router.push("/signup")}
              className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-full shadow-lg shadow-gray-900/20 transition-transform active:scale-95 text-xs sm:text-sm"
            >
              Sign Up
            </button>
          </div>
        )}
      </nav>
    </div>
  );
}
