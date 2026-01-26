import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ManualHotel from "@/models/ManualHotel";

const KEY = process.env.GOOGLE_MAPS_KEY;

function decodePolyline(encoded) {
  let index = 0,
    lat = 0,
    lng = 0,
    coordinates = [];

  while (index < encoded.length) {
    let b,
      shift = 0,
      result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    coordinates.push([lng / 1e5, lat / 1e5]);
  }

  return coordinates; 
}

async function geocode(place) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    place,
  )}&key=${KEY}`;

  const res = await fetch(url);
  const json = await res.json();

  if (json.status !== "OK") {
    throw new Error(`Geocoding failed: ${json.status}`);
  }

  const loc = json.results[0].geometry.location;
  return { lat: loc.lat, lng: loc.lng };
}

async function getRoute(a, b) {
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${a.lat},${a.lng}&destination=${b.lat},${b.lng}&key=${KEY}`;
  const res = await fetch(url);
  const json = await res.json();

  if (json.status !== "OK" || !json.routes.length) {
    throw new Error(`Directions failed: ${json.status}`);
  }

  const r = json.routes[0];

  return {
    distance: (r.legs[0].distance.value / 1000).toFixed(1),
    time: (r.legs[0].duration.value / 3600).toFixed(1),
    route: decodePolyline(r.overview_polyline.points),
    steps: r.legs[0].steps,
  };
}

async function fetchPhone(placeId) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_phone_number&key=${KEY}`;
  const res = await fetch(url);
  const json = await res.json();

  if (json.status === "OK") {
    return json.result.formatted_phone_number || null;
  }
  return null;
}

async function fetchHotels(lat, lng) {
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=lodging&key=${KEY}`;
  const res = await fetch(url);
  const json = await res.json();

  if (json.status !== "OK" && json.status !== "ZERO_RESULTS") {
    throw new Error(`Places failed: ${json.status}`);
  }

  const results = json.results || [];
  const hotels = [];

  for (const p of results) {
    let phone = null;
    try {
      phone = await fetchPhone(p.place_id);
    } catch {}

    hotels.push({
      _id: `g-${p.place_id}`,
      name: p.name,
      price: Math.round(p.price_level ? p.price_level * 500 + Math.random() * 1000 : 1000 + Math.random() * 500),
      lat: p.geometry.location.lat,
      lng: p.geometry.location.lng,
      rating: p.rating || 0,
      phone,
      images: p.photos
        ? [
            `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${p.photos[0].photo_reference}&key=${KEY}`,
          ]
        : [],
    });
  }

  return hotels;
}

// ---------- API ----------

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!start || !end) {
      return NextResponse.json(
        { error: "Start and End are required" },
        { status: 400 },
      );
    }

    const a = await geocode(start);
    const b = await geocode(end);

    const r = await getRoute(a, b);

    // Spread samples along the whole route
    const hotels = [];
    const steps = r.steps;
    const sampleCount = Math.min(8, steps.length);

    for (let i = 0; i < sampleCount; i++) {
      const idx = Math.floor((i / sampleCount) * steps.length);
      const s = steps[idx];

      try {
        const h = await fetchHotels(s.end_location.lat, s.end_location.lng);
        hotels.push(...h);
      } catch (e) {
        console.error("Hotel fetch failed:", e.message);
      }
    }

    // Deduplicate by place_id
    const unique = {};
    hotels.forEach((h) => {
      unique[h._id] = h;
    });

    // ---- Merge Admin Manual Hotels ----
    await connectDB();

    // Load all manual stays
    const manual = await ManualHotel.find();
    console.log("Manual hotels in DB:", manual.length);

    // Helper: check if a point is near the route
    function isNearRoute(lat, lng, steps, maxKm = 50) {
      function haversine(a, b, c, d) {
        const R = 6371;
        const dLat = ((c - a) * Math.PI) / 180;
        const dLng = ((d - b) * Math.PI) / 180;
        const x =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((a * Math.PI) / 180) *
            Math.cos((c * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
      }

      for (const s of steps) {
        const p = s.end_location;
        const d = haversine(lat, lng, p.lat, p.lng);
        if (d <= maxKm) return true;
      }
      return false;
    }

    // Keep only manual hotels near this route
    const manualOnRoute = manual
      .filter((m) => {
        const isNear = isNearRoute(m.lat, m.lng, r.steps);
        console.log(
          `Hotel ${m.name}: lat=${m.lat}, lng=${m.lng}, isNear=${isNear}`,
        );
        return isNear;
      })
      .map((m) => ({
        _id: `m-${m._id}`,
        name: m.name,
        price: m.price,
        lat: m.lat,
        lng: m.lng,
        rating: 0,
        images: m.image ? [m.image] : [],
        phone: m.phone,
        type: m.type,
        source: "manual",
      }));

    // Merge with Google hotels
    hotels.push(...manualOnRoute);

    // Add manual hotels to unique dict
    manualOnRoute.forEach((h) => {
      unique[h._id] = h;
    });

    return NextResponse.json({
      start,
      end,
      distance: r.distance,
      time: r.time,
      route: r.route,
      hotels: Object.values(unique),
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
