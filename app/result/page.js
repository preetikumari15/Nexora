"use client";
import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast, Bounce } from "react-toastify";

import {
  MapPin,
  Navigation,
  Star,
  Phone,
  MessageCircle,
  Search,
  Filter,
  Save,
  Map as MapIcon,
  X,
  Send,
} from "lucide-react";

function estimateETA(totalHours, index, total) {
  const ratio = index / total;
  const minutes = Math.round(totalHours * 60 * ratio);
  const base = new Date();
  base.setMinutes(base.getMinutes() + minutes);
  return base.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getBestStop(hotels, totalHours) {
  if (!hotels.length) return null;

  const enriched = hotels.map((h, i) => {
    const eta = estimateETA(totalHours, i, hotels.length);
    const [hh, mm] = eta.split(":").map(Number);
    const mins = hh * 60 + mm;
    return { ...h, _mins: mins, _eta: eta };
  });

  const evening = enriched.filter(
    (h) => h._mins >= 18 * 60 && h._mins <= 22 * 60,
  );

  if (evening.length) {
    return evening.sort((a, b) => a.price - b.price)[0];
  }

  return enriched[Math.floor(enriched.length / 2)];
}

function getFinalRating(h, reviewData) {
  const manual = reviewData[h._id]?.avg || 0;
  const google = h.rating || 0;

  if (manual && google) return ((manual + google) / 2).toFixed(1);
  if (manual) return manual.toFixed(1);
  if (google) return google.toFixed(1);
  return null;
}

export default function Result() {
  const router = useRouter();
  const params = useSearchParams();
  const start = params.get("start");
  const end = params.get("end");

  const [data, setData] = useState(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});

  // Filters
  const [maxPrice, setMaxPrice] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [userPos, setUserPos] = useState(null);

  // Chat
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi! Ask me about stops, hotels, or your route." },
  ]);
  const [question, setQuestion] = useState("");

  // Reviews & Plan
  const [reviewBox, setReviewBox] = useState(null);
  const [reviewData, setReviewData] = useState({});
  const [myRating, setMyRating] = useState(5);
  const [myComment, setMyComment] = useState("");
  const [planOpen, setPlanOpen] = useState(false);
  const [journeyPlan, setJourneyPlan] = useState([]);

  useEffect(() => {
    if (!start || !end) return;

    fetch(`/api/route?start=${start}&end=${end}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          alert(d.error);
          return;
        }
        setData(d);
      });
  }, [start, end]);

  useEffect(() => {
    if (!data || !data.route || !data.route.length) return;

    let isMounted = true;
    let map;

    if (mapRef.current) {
      try {
        mapRef.current.off();
        mapRef.current.remove();
      } catch (e) {
        console.error("Error removing previous map:", e);
      }
      mapRef.current = null;
    }

    (async () => {
      try {
        const L = (await import("leaflet")).default;
        await import("leaflet/dist/leaflet.css");

        if (!isMounted) return;

        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        const mapContainer = document.getElementById("map");
        if (!mapContainer || !isMounted) return;

        if (mapContainer._leaflet_id) {
          return;
        }

        map = L.map("map", { zoomControl: false }).setView(
          [data.route[0][1], data.route[0][0]],
          6,
        );

        if (!isMounted) {
          map.remove();
          return;
        }

        L.control.zoom({ position: "bottomright" }).addTo(map);

        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
          {
            attribution: "© OpenStreetMap © CartoDB",
          },
        ).addTo(map);

        const latLngs = data.route.map(([lng, lat]) => [lat, lng]);
        const line = L.polyline(latLngs, { color: "#ec4899", weight: 4 }).addTo(
          map,
        );
        map.fitBounds(line.getBounds(), { padding: [50, 50] });

        const markers = {};
        data.hotels.forEach((h) => {
          if (!h.lat || !h.lng) return;

          const directionsURL = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(start)}&destination=${h.lat},${h.lng}&travelmode=driving`;

          const m = L.marker([h.lat, h.lng]).addTo(map).bindPopup(`
              <div style="font-family: sans-serif; min-width: 150px;">
                <h3 style="margin:0; font-weight:700; font-size:14px;">${h.name}</h3>
                <div style="margin-top:4px; font-size:12px; color:#666;">
                  ${h.price ? `₹${h.price}` : "Price N/A"} • ${h.rating ? `★ ${h.rating}` : ""}
                </div>
                <a href="${directionsURL}" target="_blank" style="display:block; margin-top:6px; color:#ec4899; text-decoration:none; font-weight:600; font-size:12px;">
                  Get Directions →
                </a>
              </div>
            `);
          markers[h._id] = m;
        });

        if (isMounted) {
          mapRef.current = map;
          markersRef.current = markers;
        }
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    })();

    return () => {
      isMounted = false;
      if (mapRef.current) {
        try {
          mapRef.current.off();
          mapRef.current.remove();
        } catch (e) {
          console.error("Error cleaning up map:", e);
        }
        mapRef.current = null;
      }
    };
  }, [data]);

  function locateMe() {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });

        if (mapRef.current)
          mapRef.current.flyTo([pos.coords.latitude, pos.coords.longitude], 10);
      },
      () => alert("Unable to fetch your location"),
    );
  }

  if (!data || !data.route) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#f8f9fc]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-gray-500 font-medium">Finding optimal route...</p>
      </div>
    );
  }

  const filteredHotels = data.hotels
    .filter((h) => !maxPrice || h.price <= Number(maxPrice))
    .filter((h) =>
      !typeFilter
        ? true
        : h.name.toLowerCase().includes(typeFilter) ||
          h.type?.toLowerCase().includes(typeFilter),
    )
    .filter((h) => {
      if (!userPos) return true;

      const dHotel =
        Math.abs(h.lat - userPos.lat) + Math.abs(h.lng - userPos.lng);
      const dStart =
        Math.abs(data.route[0][1] - userPos.lat) +
        Math.abs(data.route[0][0] - userPos.lng);
      return dHotel > dStart;
    });

  const bestStop = getBestStop(filteredHotels, parseFloat(data.time));

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#f8f9fc] relative overflow-hidden">
      <div className="w-full md:w-112.5 lg:w-125 flex flex-col h-[60vh] md:h-full bg-white/80 backdrop-blur-md z-10 shadow-2xl relative">
        <div className="pt-12 pb-4 px-6 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2 text-md font-bold text-orange-500 uppercase tracking-widest mb-2">
            <Navigation size={18} /> Route Details
          </div>
          <h1 className="text-2xl font-bold text-gray-900 truncate flex items-center gap-2">
            {data.start} <span className="text-gray-300">→</span> {data.end}
          </h1>
          <p className="text-sm text-gray-500 mt-1 flex gap-2 mb-2">
            <span>🚗 {data.distance} km</span>
            <span className="w-px h-4 bg-gray-300"></span>
            <span>⏱️ {data.time} hrs</span>
          </p>
        </div>

        {/* Filters */}
        <div className="p-4 space-y-3 bg-gray-50/50 border-b border-gray-100">
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="number"
                placeholder="Max Price (₹)"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-200"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-200 appearance-none"
              >
                <option value="">All Types</option>
                <option value="hotel">Hotel</option>
                <option value="dharamshala">Dharamshala</option>
                <option value="guest">Guest House</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={locateMe}
              className="flex items-center justify-center gap-2 bg-white border border-blue-300 hover:bg-blue-50 text-gray-700 py-2 px-4 rounded-xl text-sm font-medium transition-colors hover:cursor-pointer"
            >
              <MapPin size={14} className="text-blue-500" /> Near Me
            </button>

            <button
              onClick={() =>
                router.push(
                  `/plan?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`,
                )
              }
              className="flex items-center justify-center gap-2 hover:bg-yellow-100 text-yellow-700 py-2 px-4 rounded-xl text-sm hover: cursor-pointer font-medium transition-colors border border-yellow-400"
            >
              <MapIcon size={14} /> Plan Journey
            </button>
            {userPos && (
              <div className="text-xs text-green-600">
                Showing hotels ahead of your current location
              </div>
            )}
          </div>

          {/* Save Trip Button */}
          {typeof window !== "undefined" && localStorage.getItem("token") && (
            <button
              onClick={async () => {
                const token = localStorage.getItem("token");
                const res = await fetch("/api/trips/save", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    start: data.start,
                    end: data.end,
                    distance: data.distance,
                    time: data.time,
                    bestStop: bestStop
                      ? {
                          name: bestStop.name,
                          price: bestStop.price,
                          eta: bestStop._eta,
                        }
                      : null,
                  }),
                });
                const json = await res.json();
                if (!res.ok) {
                  alert(json.error || "Failed to save");
                  return;
                }

                toast.success("Trip saved successfully!", {
                  position: "top-center",
                  autoClose: 3000,
                  hideProgressBar: false,
                  closeOnClick: false,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  theme: "light",
                  transition: Bounce,
                });
              }}
              className="w-full flex items-center justify-center gap-2 bg-green-700 text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-gray-900/10 hover:bg-green-800 transition-all hover:cursor-pointer"
            >
              <Save size={14} /> Save This Trip
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Recommended Stop */}
          {bestStop && (
            <div
              className="bg-linear-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-4 shadow-sm relative overflow-hidden group cursor-pointer"
              onClick={() => {
                const m = markersRef.current[bestStop._id];
                if (m && mapRef.current) {
                  mapRef.current.setView(m.getLatLng(), 14);
                  m.openPopup();
                }
              }}
            >
              <div className="absolute top-0 right-0 bg-yellow-400 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg shadow-sm">
                RECOMMENDED
              </div>
              <h3 className="font-bold text-gray-900 pr-12">{bestStop.name}</h3>
              <p className="text-xs text-yellow-800 font-medium mt-1">
                Reach around {bestStop._eta} · ₹{bestStop.price}
              </p>
            </div>
          )}

          {/* List */}
          {filteredHotels.map((h) => {
            const finalRating = getFinalRating(h, reviewData);
            return (
              <div
                key={h._id}
                className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all cursor-pointer group flex gap-4"
                onClick={() => {
                  const m = markersRef.current[h._id];
                  if (m && mapRef.current) {
                    mapRef.current.setView(m.getLatLng(), 14);
                    m.openPopup();
                  }
                }}
              >
                <div className="w-24 h-24 shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                  {h.images?.[0] ? (
                    <img
                      src={h.images[0]}
                      alt={h.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <MapPin size={24} />
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm leading-tight">
                      {h.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm font-semibold text-gray-600">
                        ₹{h.price || "N/A"}
                      </span>
                      {finalRating && (
                        <span className="flex items-center gap-1 text-xs font-bold text-yellow-500 bg-yellow-50 px-1.5 py-0.5 rounded">
                          <Star size={12} fill="currentColor" /> {finalRating}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-2 border-t border-gray-50 pt-2">
                    {h.phone && (
                      <a
                        href={`tel:${h.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-green-600 hover:text-green-500 transition-colors"
                      >
                        <Phone size={16} />
                      </a>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(
                          `https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`,
                        );
                      }}
                      className="text-blue-600 hover:text-blue-400 transition-colors"
                    >
                      <Navigation size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!localStorage.getItem("token"))
                          return alert("Login to review");
                        setReviewBox(h._id);
                      }}
                      className="text-gray-400 hover:text-orange-500 transition-colors ml-auto text-xs font-medium"
                    >
                      Add Review
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- Map Section --- */}
      <div className="flex-1 h-[40vh] md:h-full order-first md:order-last bg-gray-200 relative">
        <div id="map" className="w-full h-full z-0" />
      </div>

      {/* --- Chat --- */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-11 w-16 h-16 bg-green-600 text-white rounded-full shadow-2xl hover:scale-105 transition-transform flex items-center justify-center z-50 group"
      >
        {chatOpen ? (
          <X size={24} />
        ) : (
          <MessageCircle
            size={30}
            className="group-hover:animate-pulse hover:cursor-pointer"
          />
        )}
      </button>

      {/* Chat Window */}
      {chatOpen && (
        <div className="fixed bottom-24 right-6 w-80 md:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5">
          <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
            <span className="font-bold text-sm">Nexora Assistant</span>
            <button
              onClick={() => setChatOpen(false)}
              className="text-white/60 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    m.role === "user"
                      ? "bg-gray-900 text-white rounded-br-none"
                      : "bg-white border border-gray-200 text-gray-700 rounded-bl-none shadow-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
              placeholder="Ask about your route..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter")
                  document.getElementById("send-btn")?.click();
              }}
            />
            <button
              id="send-btn"
              className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full transition-colors"
              onClick={async () => {
                if (!question || !data) return;
                setMessages((p) => [...p, { role: "user", text: question }]);
                const q = question;
                setQuestion("");
                const res = await fetch("/api/chat", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    question: q,
                    context: {
                      start: data.start,
                      end: data.end,
                      distance: data.distance,
                      time: data.time,
                      hotels: filteredHotels.map((h) => ({
                        name: h.name,
                        price: h.price,
                        rating: h.rating,
                      })),
                    },
                  }),
                });
                const json = await res.json();
                setMessages((p) => [...p, { role: "ai", text: json.answer }]);
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewBox && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-4xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
            <h3 className="font-bold text-xl mb-4">Add Review</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Rating
                </label>
                <div className="flex gap-2 mt-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setMyRating(n)}
                      className={`p-2 rounded-lg ${myRating >= n ? "text-yellow-500 bg-yellow-50" : "text-gray-300 bg-gray-50"}`}
                    >
                      <Star size={20} fill="currentColor" />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Comment
                </label>
                <textarea
                  className="w-full mt-1 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-orange-500"
                  rows={3}
                  placeholder="How was your stay?"
                  value={myComment}
                  onChange={(e) => setMyComment(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setReviewBox(null)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  className="flex-1 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-black"
                  onClick={async () => {
                    const token = localStorage.getItem("token");
                    const res = await fetch("/api/reviews/add", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        hotelId: reviewBox,
                        rating: myRating,
                        comment: myComment,
                      }),
                    });
                    if (!res.ok) {
                      const err = await res.json();
                      alert(err.error || "Failed");
                      return;
                    }
                    setReviewBox(null);
                    setMyComment("");
                    toast.success("Review Submitted!", {
                      position: "top-center",
                      autoClose: 3000,
                      hideProgressBar: false,
                      closeOnClick: false,
                      pauseOnHover: true,
                      draggable: true,
                      progress: undefined,
                      theme: "light",
                      transition: Bounce,
                    });
                  }}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
