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
    <div className="fixed top-0 left-0 w-full z-50 px-4 py-4 sm:px-6 flex justify-center pointer-events-none">
      <nav className="pointer-events-auto w-full max-w-6xl bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl shadow-gray-200/40 rounded-full px-5 py-3 flex items-center justify-between transition-all">
        {/* Logo Section */}
        <div
          className="font-bold text-xl tracking-tight cursor-pointer flex items-center gap-2 text-gray-900"
          onClick={() => router.push("/")}
        >
          <div className="w-8 h-8 rounded-full bg-linear-to-tr from-orange-400 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
            N
          </div>
          Nexora
        </div>

        {/* Right Actions Section */}
        {user ? (
          // --- LOGGED IN STATE ---
          <div className="flex items-center gap-1 sm:gap-4">
            <div className="hidden sm:flex items-center gap-4 text-sm font-medium text-gray-700">
              <button
                onClick={() => router.push("/")}
                className="hover:text-black transition-colors hover:cursor-pointer"
              >
                Home
              </button>
              <button
                onClick={() => router.push("/trips")}
                className="hover:text-black hover:cursor-pointer transition-colors"
              >
                My Trips
              </button>
            </div>

            <div className="h-4 w-px bg-gray-300 mx-2 hidden sm:block"></div>

            {/* Admin Link */}
            <button
              onClick={() => router.push("/admin/login")}
              title="Admin Panel"
              className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all hover:cursor-pointer"
            >
              <Shield size={18} />
            </button>

            {/* User */}
            <div className="flex items-center gap-2 pl-2 pr-1 py-1 bg-gray-100 rounded-full border border-gray-200">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-gray-400">
                <User size={14} />
              </div>
              <span className="text-sm font-semibold text-gray-700 mr-2 max-w-25 truncate">
                {user.name}
              </span>
              <button
                onClick={logout}
                className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors shadow-sm hover:cursor-pointer"
                title="Logout"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        ) : (
          // --- LOGGED OUT STATE ---
          <div className="flex items-center gap-3 text-sm font-medium">
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
              className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-full shadow-lg shadow-gray-900/20 transition-transform active:scale-95"
            >
              Login
            </button>
          </div>
        )}
      </nav>
    </div>
  );
}
