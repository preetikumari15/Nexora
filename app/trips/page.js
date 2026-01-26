"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Clock,
  Calendar,
  ArrowRight,
  Star,
  Zap,
  Loader2,
} from "lucide-react";

export default function MyTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch("/api/trips/list", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          alert(d.error);
          return;
        }
        setTrips(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f9fc] text-gray-900 font-sans relative overflow-x-hidden">
      {/* --- Background --- */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-150 h-150 bg-blue-100 rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] right-[-5%] w-125 h-125 bg-purple-100 rounded-full blur-[100px] opacity-50" />
      </div>

      <main className="max-w-5xl mx-auto px-6 pt-32 pb-20">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-xs font-bold tracking-wider mb-4 border border-purple-100">
            <Zap size={12} fill="currentColor" /> TRAVEL HISTORY
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            My Journeys
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Review your saved routes and recommended stops.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-purple-500" />
            <p>Loading your trips...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && trips.length === 0 && (
          <div className="bg-white/60 backdrop-blur-md border border-white/60 rounded-4xl p-12 text-center shadow-lg shadow-gray-200/50">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              No trips saved yet
            </h3>
            <p className="text-gray-500 mt-2 mb-8 max-w-sm mx-auto">
              Start searching for your next destination to save routes and find
              the best stops.
            </p>
            <button
              onClick={() => router.push("/")}
              className="bg-gray-900 text-white px-8 py-3 rounded-full font-bold hover:bg-black transition-all shadow-lg shadow-gray-900/20"
            >
              Start Exploring
            </button>
          </div>
        )}

        {/* Trips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {trips.map((t) => (
            <div
              key={t._id}
              onClick={() => {
                router.push(
                  `/result?start=${encodeURIComponent(t.start)}&end=${encodeURIComponent(t.end)}`,
                );
              }}
              className="group bg-white border border-purple-300 rounded-4xl p-6 shadow-sm hover:shadow-xl hover:shadow-purple-500/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-linear-to-br from-purple-50/0 to-purple-50/0 group-hover:from-purple-50/30 group-hover:to-blue-50/30 transition-all duration-500" />

              <div className="relative z-10">
                {/* Route Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                      From
                    </p>
                    <h3
                      className="font-bold text-lg text-gray-900 line-clamp-1"
                      title={t.start}
                    >
                      {t.start}
                    </h3>
                  </div>
                  <div className="flex items-center justify-center text-gray-300">
                    <ArrowRight
                      size={20}
                      className="group-hover:text-purple-500 group-hover:scale-110 transition-all"
                    />
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                      To
                    </p>
                    <h3
                      className="font-bold text-lg text-gray-900 line-clamp-1"
                      title={t.end}
                    >
                      {t.end}
                    </h3>
                  </div>
                </div>

                <div className="flex gap-4 mb-6">
                  <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 text-sm font-medium text-gray-600">
                    <MapPin size={14} className="text-blue-500" />
                    {t.distance} km
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 text-sm font-medium text-gray-600">
                    <Clock size={14} className="text-orange-500" />
                    {t.time} hrs
                  </div>
                </div>

                {/* Recommended Stop Highlight */}
                {t.bestStop && (
                  <div className="bg-yellow-100 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
                    <div className="bg-yellow-200/50 p-2 rounded-lg text-yellow-600 shrink-0">
                      <Star size={16} fill="currentColor" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-yellow-700 uppercase tracking-wide mb-0.5">
                        Recommended Stop
                      </p>
                      <p className="font-bold text-gray-900 text-sm">
                        {t.bestStop.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        ₹{t.bestStop.price} approx.
                      </p>
                    </div>
                  </div>
                )}

                {!t.bestStop && (
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center justify-center text-sm text-gray-400 italic min-h-21.5">
                    No specific stop saved.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
