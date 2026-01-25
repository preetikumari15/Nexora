"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function MyTrips() {
  const [trips, setTrips] = useState([]);
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
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-xl font-bold mb-4">My Trips</h1>

      {trips.length === 0 && (
        <div className="text-gray-500">No trips saved yet.</div>
      )}

      <div className="space-y-3">
        {trips.map((t) => (
          <div
            key={t._id}
            className="bg-white p-4 rounded shadow cursor-pointer"
            onClick={() => {
              router.push(
                `/result?start=${encodeURIComponent(
                  t.start
                )}&end=${encodeURIComponent(t.end)}`
              );
            }}
          >
            <div className="font-semibold">
              {t.start} → {t.end}
            </div>
            <div className="text-sm text-gray-600">
              {t.distance} km · {t.time} hrs
            </div>

            {t.bestStop && (
              <div className="text-xs text-yellow-700 mt-1">
                ⭐ Best Stop: {t.bestStop.name} (₹{t.bestStop.price})
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
