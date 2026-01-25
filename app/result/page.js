"use client";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";

/* ---------- Best Stop Helpers ---------- */
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
    (h) => h._mins >= 18 * 60 && h._mins <= 22 * 60
  );

  if (evening.length) {
    return evening.sort((a, b) => a.price - b.price)[0];
  }

  return enriched[Math.floor(enriched.length / 2)];
}

export default function Result() {
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

  /* ---------- Fetch Route + Hotels ---------- */
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

  /* ---------- Map ---------- */
  useEffect(() => {
    if (!data) return;

    let map;

    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      map = L.map("map").setView(
        [data.route[0][1], data.route[0][0]],
        6
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);

      const latLngs = data.route.map(([lng, lat]) => [lat, lng]);
      const line = L.polyline(latLngs, { color: "blue" }).addTo(map);
      map.fitBounds(line.getBounds());

      const markers = {};
      data.hotels.forEach((h) => {
        if (!h.lat || !h.lng) return;

        const directionsURL = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
          start
        )}&destination=${h.lat},${h.lng}&travelmode=driving`;

        const m = L.marker([h.lat, h.lng])
          .addTo(map)
          .bindPopup(`
            <div style="font-size:13px">
              <b>${h.name}</b><br/>
              ₹${h.price} · ⭐ ${h.rating || "N/A"}<br/>
              <a href="${directionsURL}" target="_blank" style="color:#2563eb">
                Get Directions
              </a>
            </div>
          `);

        markers[h._id] = m;
      });

      mapRef.current = map;
      markersRef.current = markers;
    })();

    return () => {
      if (map) map.remove();
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
      },
      () => alert("Unable to fetch your location")
    );
  }

  if (!data) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading route...
      </div>
    );
  }

  const filteredHotels = data.hotels
    .filter((h) => !maxPrice || h.price <= Number(maxPrice))
    .filter((h) =>
      !typeFilter ? true : h.name.toLowerCase().includes(typeFilter)
    )
    .filter((h) => {
      if (!userPos) return true;

      const dHotel =
        Math.abs(h.lat - userPos.lat) +
        Math.abs(h.lng - userPos.lng);

      const dStart =
        Math.abs(data.route[0][1] - userPos.lat) +
        Math.abs(data.route[0][0] - userPos.lng);

      return dHotel > dStart;
    });

  const bestStop = getBestStop(filteredHotels, parseFloat(data.time));

  return (
    <div className="grid grid-cols-3 h-screen overflow-hidden">
      {/* Left: Hotels */}
      <div className="p-4 overflow-y-auto">
        <h2 className="font-bold text-lg">
          {data.start} → {data.end}
        </h2>
        <p className="text-sm text-gray-600 mb-2">
          {data.distance} km · {data.time} hrs
        </p>

        {/* Filters */}
        <div className="space-y-2 mb-3">
          <input
            className="border p-1 w-full text-sm"
            placeholder="Max Price (₹)"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />

          <select
            className="border p-1 w-full text-sm"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="hotel">Hotel</option>
            <option value="guest">Guest House</option>
            <option value="lodge">Lodge</option>
          </select>

          <button
            onClick={locateMe}
            className="border p-1 w-full text-sm bg-gray-100"
          >
            📍 Where am I right now?
          </button>

          {userPos && (
            <div className="text-xs text-green-600">
              Showing hotels ahead of your current location
            </div>
          )}
        </div>

        {/* Best Stop */}
        {bestStop && (
          <div className="border-2 border-yellow-400 bg-yellow-50 p-2 rounded mb-3">
            <div className="text-xs font-semibold text-yellow-700">
              ⭐ Recommended Night Stop
            </div>
            <div className="font-bold">{bestStop.name}</div>
            <div className="text-xs">
              Reach around {bestStop._eta} · ₹{bestStop.price}
            </div>
          </div>
        )}

        {/* Hotels */}
        <div className="space-y-2">
          {filteredHotels.map((h) => (
            <div
              key={h._id}
              className="border p-2 rounded cursor-pointer"
              onClick={() => {
                const m = markersRef.current[h._id];
                if (m && mapRef.current) {
                  const { lat, lng } = m.getLatLng();
                  mapRef.current.setView([lat, lng], 14);
                  m.openPopup();
                }
              }}
            >
              {h.images?.[0] && (
                <img
                  src={h.images[0]}
                  alt={h.name}
                  className="w-full h-24 object-cover rounded mb-1"
                />
              )}

              <b>{h.name}</b>
              <div className="text-sm">₹{h.price}</div>
              <div className="text-xs text-gray-500 mb-1">
                ⭐ {h.rating || "N/A"}
              </div>

              <div className="flex gap-3 text-xs">
                {h.phone && (
                  <a
                    href={`tel:${h.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-green-600"
                  >
                    Call
                  </a>
                )}

                <a
                  href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
                    start
                  )}&destination=${h.lat},${h.lng}&travelmode=driving`}
                  target="_blank"
                  onClick={(e) => e.stopPropagation()}
                  className="text-blue-600"
                >
                  Directions
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Map */}
      <div id="map" className="col-span-2 h-full" />

      {/* Chat */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shadow-lg z-[999]"
      >
        💬
      </button>

      {chatOpen && (
        <div className="fixed bottom-20 right-6 w-80 bg-white border rounded shadow-lg z-[999] flex flex-col">
          <div className="p-2 border-b font-semibold text-sm flex justify-between">
            Travel Assistant
            <button onClick={() => setChatOpen(false)}>✕</button>
          </div>

          <div className="h-60 overflow-y-auto p-3 space-y-2 text-sm">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-2 rounded ${
                  m.role === "user"
                    ? "bg-blue-100 text-right"
                    : "bg-gray-100"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>

          <div className="flex gap-1 p-2 border-t">
            <input
              className="border p-1 flex-1 text-sm"
              placeholder="Ask..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  document.getElementById("send-btn")?.click();
                }
              }}
            />
            <button
              id="send-btn"
              className="bg-black text-white px-2 text-sm"
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
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


