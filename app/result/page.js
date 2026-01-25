"use client";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";

export default function Result() {
  const params = useSearchParams();
  const start = params.get("start");
  const end = params.get("end");

  const [data, setData] = useState(null);
  const mapRef = useRef(null);

  // Fetch route data
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

  // Initialize map after data loads
  useEffect(() => {
    if (!data) return;

    let map;

    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

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

      mapRef.current = map;
    })();

    return () => {
      if (map) map.remove();
    };
  }, [data]);

  if (!data) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading route...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 h-screen">
      <div id="map" className="col-span-2 h-full" />
      <div className="p-4">
        <h2 className="font-bold text-lg">
          {data.start} → {data.end}
        </h2>
        <p className="text-sm text-gray-600">
          {data.distance} km · {data.time} hrs
        </p>

        <div className="mt-4 text-sm text-gray-500">
          Hotels will appear here in the next step…
        </div>
      </div>
    </div>
  );
}
