"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, MapPin, ShieldCheck, Star, Zap } from "lucide-react";

export default function Home() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (!start || !end) {
      alert("Please enter both locations to start your journey.");
      return;
    }
    router.push(
      `/result?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`,
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] text-gray-900 selection:bg-orange-200 font-sans overflow-x-hidden relative">
      {/* --- Background Gradients (Softer/Lighter) --- */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-150 h-150 bg-blue-100 rounded-full blur-[120px] opacity-60" />
        <div className="absolute top-[20%] right-[-5%] w-125 h-125 bg-orange-100 rounded-full blur-[100px] opacity-60" />
        <div className="absolute bottom-[-10%] left-[20%] w-150 h-150 bg-purple-100 rounded-full blur-[120px] opacity-50" />
      </div>

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-12 sm:pt-40 sm:pb-20">
        {/* --- Hero Section --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-bold tracking-wider mb-6">
              <Zap size={14} fill="currentColor" /> NEXORA
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.1] mb-6 text-gray-900">
              Discover Your <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-500 to-pink-600">
                Perfect Stay.
              </span>
            </h1>
            <p className="text-gray-500 text-lg max-w-md leading-relaxed mb-8">
              Discover the perfect hotels, dharamshalas, and rest stops along your entire route, not just at the destination.
            </p>

            <button
              onClick={() =>
                document
                  .getElementById("search-card")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="group bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-full text-sm font-semibold tracking-wide transition-all duration-300 flex items-center gap-2 shadow-lg shadow-gray-900/20 hover:cursor-pointer"
            >
              Start Searching
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Abstract Visual Right - Clean Graphic */}
          <div className="hidden lg:flex justify-center items-center relative">
            <div className="relative w-80 h-80">
              <div className="absolute inset-0 bg-linear-to-tr from-orange-400 to-pink-500 rounded-[3rem] rotate-6 opacity-20 blur-2xl"></div>
              <img
                src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Travel"
                className="w-full h-full object-cover rounded-[3rem] shadow-2xl rotate-3 border-4 border-white hover:rotate-0 transition-transform duration-700"
              />
            </div>
          </div>
        </div>

        {/* --- Bento Grid Layout --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(200px,auto)] ">
          {/* Card 1: Main Search Interface (Light, clean, utility focused) */}
          <div
            id="search-card"
            className="md:col-span-7 bg-white border border-pink-200 rounded-[2.5rem] p-8 sm:p-12 relative overflow-hidden shadow-2xl shadow-pink-200/50 hover:shadow-pink-300/40 transition-shadow mb-16"
          >
            <h2 className="text-3xl font-bold mb-2 text-gray-900">
              Plan Route
            </h2>
            <p className="text-gray-400 mb-8">
              Find the best hotels and dharamshalas on your route.
            </p>

            <div className="flex flex-col gap-5 relative z-10">
              <div className="space-y-2">
                <label className="text-xs text-gray-400 ml-2 uppercase tracking-wider font-semibold">
                  From
                </label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 w-5 h-5 transition-transform group-focus-within:scale-110" />
                  <input
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    placeholder="Delhi"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-400 ml-2 uppercase tracking-wider font-semibold">
                  To
                </label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-500 w-5 h-5 transition-transform group-focus-within:scale-110" />
                  <input
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    placeholder="Manali"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all font-medium"
                  />
                </div>
              </div>

              <button
                onClick={handleSearch}
                className="mt-4 bg-gray-900 text-white hover:bg-gray-700 font-bold py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-gray-900/20 active:scale-[0.98] hover:cursor-pointer"
              >
                Search Stays
              </button>
            </div>
          </div>

          {/* Card 2: Stats / Trust (Clean typography emphasis) */}
          <div className="md:col-span-5 bg-white border border-gray-100 rounded-[2.5rem] p-8 sm:p-12 relative flex flex-col justify-center overflow-hidden shadow-lg shadow-gray-200/40 mb-16">
            {/* Decorative Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -mr-8 -mt-8" />

            <div className="relative z-10">
              <div className="flex items-baseline gap-2">
                <h3 className="text-6xl sm:text-7xl font-bold text-gray-900 tracking-tighter">
                  Stays
                </h3>
              </div>
              <p className="text-gray-500 mt-2 text-lg font-medium">
                According to your route
              </p>
              <div className="h-1 w-16 bg-linear-to-r from-orange-400 to-pink-500 rounded-full mt-6 mb-6"></div>
              <p className="text-sm text-gray-400 leading-relaxed font-medium">
                Over 10,000+ hotels and dharamshalas available along popular
                travel routes. Trusted by thousands of travelers for seamless
                bookings and verified stays.
              </p>
            </div>
          </div>

          {/* Card 3: Feature Highlight - With Image Background */}
          <div className="md:col-span-4 relative h-64 md:h-auto rounded-[2.5rem] overflow-hidden group shadow-lg shadow-gray-200/40">
            {/* Background Image */}
            <img
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Luxury Hotel"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute bottom-0 left-0 p-8 text-white">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-3 border border-white/30">
                <ShieldCheck className="text-green-500 w-5 h-5" />
              </div>
              <h4 className="text-xl font-bold">Safe & Verified</h4>
              <p className="text-gray-200 text-sm mt-1">
                100% verified hotels.
              </p>
            </div>
          </div>

          {/* Card 4: Feature Highlight - With Image Background */}
          <div className="md:col-span-4 relative h-64 md:h-auto rounded-[2.5rem] overflow-hidden group shadow-lg shadow-gray-200/40">
            <img
              src="https://images.unsplash.com/photo-1618773928121-c32242e63f39?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Cozy Room"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute bottom-0 left-0 p-8 text-white">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-3 border border-white/30">
                <Star className="text-yellow-300 w-5 h-5" />
              </div>
              <h4 className="text-xl font-bold">Best Price</h4>
              <p className="text-gray-200 text-sm mt-1">
                Lowest price guarantee.
              </p>
            </div>
          </div>

          {/* Card 5: Profile/Social (Clean Light) */}
          <div className="md:col-span-4 bg-white rounded-[2.5rem] p-8 flex items-center justify-between border border-gray-100 shadow-lg shadow-gray-200/40 ">
            <div className="flex -space-x-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-full border-4 border-white flex items-center justify-center overflow-hidden shadow-sm"
                >
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`}
                    alt="user"
                    className="w-full h-full"
                  />
                </div>
              ))}
            </div>
            <div className="text-right">
              <span className="block text-3xl font-bold text-gray-900">
                Community
              </span>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                Of Happy Travelers
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
