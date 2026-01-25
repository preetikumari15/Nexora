"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

function buildJourneyPlan(hotels, totalHours) {
  if (!hotels.length) return [];

  const dailyLimit = 9;
  const days = Math.ceil(totalHours / dailyLimit);
  const perDay = Math.max(1, Math.floor(hotels.length / days));

  const plan = [];

  for (let d = 0; d < days; d++) {
    const startIdx = d * perDay;
    const endIdx =
      d === days - 1 ? hotels.length : startIdx + perDay;

    const slice = hotels.slice(startIdx, endIdx);
    const nightStop =
      slice.sort((a, b) => a.price - b.price)[0] || null;

    plan.push({
      day: d + 1,
      drive: Math.min(
        dailyLimit,
        totalHours - d * dailyLimit
      ).toFixed(1),
      stop: nightStop,
    });
  }

  return plan;
}

export default function PlanPage() {
  const params = useSearchParams();
  const start = params.get("start");
  const end = params.get("end");

  const [data, setData] = useState(null);
  const [plan, setPlan] = useState([]);

  useEffect(() => {
    if (!start || !end) return;

    fetch(`/api/route?start=${start}&end=${end}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        const p = buildJourneyPlan(
          d.hotels,
          parseFloat(d.time)
        );
        setPlan(p);
      });
  }, [start, end]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Building your journey...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-xl font-bold mb-2">
        {data.start} → {data.end}
      </h1>
      <p className="text-sm text-gray-600 mb-4">
        {data.distance} km · {data.time} hrs
      </p>

      <div className="space-y-3">
        {plan.map((d) => (
          <div
            key={d.day}
            className="bg-white p-3 rounded shadow text-sm"
          >
            <div className="font-semibold">Day {d.day}</div>
            <div className="text-gray-600">
              Drive: {d.drive} hrs
            </div>

            {d.stop ? (
              <div className="mt-1">
                Night Stop:{" "}
                <b>{d.stop.name}</b> (₹{d.stop.price})
              </div>
            ) : (
              <div className="mt-1 text-green-600">
                Destination reached
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
