"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";


export default function Home() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Main */}
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="bg-white p-6 rounded shadow w-96 space-y-3">
          <h2 className="text-xl font-bold text-center">
            Find Hotels on Your Route
          </h2>

          <input
            className="border p-2 w-full"
            placeholder="Start location"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />

          <input
            className="border p-2 w-full"
            placeholder="End location"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />

          <button
            className="bg-black text-white w-full py-2 rounded"
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
    </div>
  );
}


