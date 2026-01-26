"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#2f3147] via-[#4a4d6d] to-[#6b6f8e] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-20 sm:py-24 md:py-28 text-center">
          <p className="text-xs sm:text-sm tracking-widest text-orange-300 mb-3">
            PREMIUM TRAVEL EXPERIENCE
          </p>

          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 leading-tight">
            Discover Your Perfect Stay
          </h1>

          <p className="text-sm sm:text-base text-gray-200 mb-8 sm:mb-10 max-w-xl sm:max-w-2xl mx-auto">
            Find the best hotels and dharamshalas on your route with comfort,
            safety and affordability.
          </p>

          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 flex flex-col md:flex-row gap-3 items-stretch max-w-md sm:max-w-xl md:max-w-3xl mx-auto">
            <input
              className="border rounded-md px-3 py-2 w-full text-black"
              placeholder="Start location"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
            <input
              className="border rounded-md px-3 py-2 w-full text-black"
              placeholder="End location"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
            <button
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md w-full md:w-auto"
              onClick={() => {
                if (!start || !end) {
                  alert("Enter both locations");
                  return;
                }
                router.push(
                  `/result?start=${encodeURIComponent(
                    start
                  )}&end=${encodeURIComponent(end)}`
                );
              }}
            >
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 text-center">
        <h2 className="text-xl sm:text-2xl font-semibold mb-8 sm:mb-10">
          Exceptional Service, Every Stay
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {[
            {
              title: "Best Price Guarantee",
              desc: "Get the lowest prices on every booking.",
            },
            {
              title: "24/7 Support",
              desc: "We are here to help anytime, anywhere.",
            },
            {
              title: "Curated Stays",
              desc: "Handpicked hotels and dharamshalas.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="bg-white p-5 sm:p-6 rounded-xl shadow hover:shadow-md transition"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-orange-100 text-orange-500 flex items-center justify-center rounded-full mx-auto mb-3 sm:mb-4">
                ★
              </div>
              <h3 className="font-semibold mb-2 text-sm sm:text-base">
                {f.title}
              </h3>
              <p className="text-gray-500 text-xs sm:text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Deals */}
      <section className="bg-gradient-to-r from-[#0f172a] to-[#1e293b] text-white py-10 sm:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3">
            Get Exclusive Deals
          </h3>
          <p className="text-gray-300 text-sm sm:text-base mb-5 sm:mb-6">
            Subscribe and get the latest hotel offers on your route.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <input
              className="px-4 py-2 rounded-md text-black w-full sm:w-72"
              placeholder="Enter your email"
            />
            <button className="bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded-md w-full sm:w-auto">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0b1220] text-gray-400 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-xs sm:text-sm">
          © {new Date().getFullYear()} SmartYatra. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
