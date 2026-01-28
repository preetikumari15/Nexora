"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Map,
  Clock,
  Calendar,
  Navigation,
  Moon,
  Sun,
  CheckCircle,
  ArrowLeft,
  Zap,
  Loader2,
  Car,
} from "lucide-react";

function buildJourneyPlan(hotels, totalHours) {
  if (!hotels.length) return [];

  const dailyLimit = 9;
  const days = Math.ceil(totalHours / dailyLimit);
  const perDay = Math.max(1, Math.floor(hotels.length / days));

  const plan = [];

  for (let d = 0; d < days; d++) {
    const startIdx = d * perDay;
    const endIdx = d === days - 1 ? hotels.length : startIdx + perDay;

    const slice = hotels.slice(startIdx, endIdx);
    const nightStop = slice.sort((a, b) => a.price - b.price)[0] || null;

    plan.push({
      day: d + 1,
      drive: Math.min(dailyLimit, totalHours - d * dailyLimit).toFixed(1),
      stop: nightStop,
    });
  }

  return plan;
}

export default function PlanPage() {
  const params = useSearchParams();
  const router = useRouter();
  const start = params.get("start");
  const end = params.get("end");

  const [data, setData] = useState(null);
  const [plan, setPlan] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!start || !end) return;

    fetch(`/api/route?start=${start}&end=${end}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        const p = buildJourneyPlan(d.hotels, parseFloat(d.time));
        setPlan(p);
        setLoading(false);
      });
  }, [start, end]);

  if (loading || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fc] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
        <p className="text-gray-500 font-medium">
          Building your perfect itinerary...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] text-gray-900 font-sans relative overflow-x-hidden selection:bg-orange-200">
      {/* --- Background --- */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-150 h-150 bg-blue-100 rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] right-[-5%] w-125 h-125 bg-orange-100 rounded-full blur-[100px] opacity-60" />
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-20 pb-12 sm:pt-30 sm:pb-20">
        {/* --- Navigation --- */}
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors"
        >
          <div className="p-2 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
            <ArrowLeft size={16} />
          </div>
          <span className="text-sm font-semibold">Back to Results</span>
        </button>

        {/* --- Header --- */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl shadow-gray-200/50 rounded-[2.5rem] p-8 sm:p-10 mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-orange-50 to-pink-50 rounded-bl-[100%] opacity-50 -z-10" />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-bold tracking-wider mb-6">
            <Zap size={14} fill="currentColor" /> JOURNEY PLAN
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            Trip to{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-500 to-pink-600">
              {data.end}
            </span>
          </h1>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl">
              <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                <Map size={12} /> From
              </div>
              <div className="font-bold text-gray-900 truncate">
                {data.start}
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl">
              <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                <Navigation size={12} /> Distance
              </div>
              <div className="font-bold text-gray-900">{data.distance} km</div>
            </div>
            <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl">
              <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                <Clock size={12} /> Drive Time
              </div>
              <div className="font-bold text-gray-900">{data.time} hrs</div>
            </div>
            <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl">
              <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar size={12} /> Duration
              </div>
              <div className="font-bold text-gray-900">{plan.length} Days</div>
            </div>
          </div>
        </div>

        {/* --- Timeline --- */}
        <div className="relative border-l-2 border-dashed border-gray-200 ml-4 md:ml-10 space-y-12 pb-10">
          {plan.map((d, index) => (
            <div key={d.day} className="relative pl-8 md:pl-12">
              <div className="absolute -left-2.25 top-8 w-5 h-5 bg-white border-4 border-orange-500 rounded-full shadow-lg z-10"></div>

              <div className="bg-white border border-gray-100 rounded-4xl p-6 sm:p-8 shadow-lg shadow-gray-200/40 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 font-bold text-lg shadow-sm">
                      {d.day}
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-gray-900">
                        Day {d.day}
                      </h3>
                      <p className="text-sm text-gray-500 font-medium">
                        Itinerary
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-xs font-bold text-gray-600">
                    <Sun size={14} className="text-orange-400" /> DAYTIME
                  </div>
                </div>

                {/* Drive Activity */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="mt-1 bg-blue-50 p-2 rounded-lg text-blue-600">
                    <Car size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">Drive Segment</h4>
                    <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                      Covering significant distance towards your destination.
                      Estimated driving time for this leg is{" "}
                      <span className="font-bold text-gray-900">
                        {d.drive} hours
                      </span>
                      .
                    </p>
                  </div>
                </div>

                <div className="h-px bg-gray-100 w-full my-6"></div>

                {/* Night Stop */}
                {d.stop ? (
                  <div className="bg-gray-900 text-white rounded-2xl p-5 sm:p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl -mr-10 -mt-10" />

                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                          <Moon size={24} className="text-purple-300" />
                        </div>
                        <div>
                          <div className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-1">
                            Recommended Night Stop
                          </div>
                          <h4 className="font-bold text-lg sm:text-xl">
                            {d.stop.name}
                          </h4>
                          <div className="flex items-center gap-3 mt-2 text-sm text-gray-300">
                            <span>₹{d.stop.price} / night</span>
                            {d.stop.rating && <span>• ★ {d.stop.rating}</span>}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          router.push(
                            `/result?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`,
                          )
                        }
                        className="bg-white text-gray-900 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors shadow-lg hover:cursor-pointer"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-100 rounded-2xl p-6 flex items-center gap-4">
                    <div className="bg-green-100 p-2 rounded-full text-green-600">
                      <CheckCircle size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-green-800 text-lg">
                        Destination Reached!
                      </h4>
                      <p className="text-green-700 text-sm">
                        You have arrived at {data.end}. Enjoy your stay!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          <div className="absolute -left-1.25 bottom-0 w-3 h-3 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
