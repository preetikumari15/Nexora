"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const name = localStorage.getItem("name");
    const token = localStorage.getItem("token");
    if (token && name) {
      setUser({ name });
    }
  }, []);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    setUser(null);
    router.push("/");
  }

  return (
    <div className="h-14 bg-white border-b flex items-center justify-between px-4">
      <div
        className="font-bold text-lg cursor-pointer"
        onClick={() => router.push("/")}
      >
        Nexora
      </div>

      {user ? (
  <div className="flex items-center gap-4 text-sm">
    <button onClick={() => router.push("/")} className="text-purple-600">Home</button>
    <button onClick={() => router.push("/trips")}>My Trips</button>

    <button
      onClick={() => router.push("/admin/login")}
      className="text-purple-600"
    >
      Admin
    </button>

    <span className="text-gray-600">Hi, {user.name}</span>

    <button
      onClick={logout}
      className="border px-3 py-1 rounded"
    >
      Logout
    </button>
  </div>
) : (
  <div className="flex gap-4 text-sm">
    <button onClick={() => router.push("/login")}>Login</button>
    <button onClick={() => router.push("/signup")}>Sign Up</button>

    <button
      onClick={() => router.push("/admin/login")}
      className="text-purple-600"
    >
      Admin
    </button>
  </div>
)}

    </div>
  );
}
