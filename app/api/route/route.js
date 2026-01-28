import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ManualHotel from "@/models/ManualHotel";

const ORS = process.env.ORS_KEY;

const HOTEL_IMAGES = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=600&q=80",
];

function getMockImage(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % HOTEL_IMAGES.length;
  return HOTEL_IMAGES[index];
}

function getMockRating(id) {
  const num = parseInt(id.replace(/\D/g, "") || "0");
  const decimal = (num % 15) / 10;
  return (3.5 + decimal).toFixed(1);
}

function getMockPrice(id) {
  const num = parseInt(id.replace(/\D/g, "") || "0");
  return 800 + (num % 32) * 100;
}

function isNearRoute(hotelLat, hotelLng, routeCoords) {
  const THRESHOLD = 0.3;

  for (let i = 0; i < routeCoords.length; i += 20) {
    const [rLng, rLat] = routeCoords[i];
    const dLat = Math.abs(hotelLat - rLat);
    const dLng = Math.abs(hotelLng - rLng);
    if (dLat + dLng < THRESHOLD) {
      return true;
    }
  }
  return false;
}

/* ----- Geocode using OpenStreetMap ------ */
async function geocode(place) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    place,
  )}&limit=1`;
  const res = await fetch(url, { headers: { "User-Agent": "Nexora/1.0" } });
  const json = await res.json();
  if (!json.length) throw new Error(`Place not found: ${place}`);
  return { lat: parseFloat(json[0].lat), lng: parseFloat(json[0].lon) };
}

/* ------ Route using OpenRouteService ------- */
async function getRoute(a, b) {
  if (!ORS) throw new Error("ORS_KEY missing");
  const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS}&start=${a.lng},${a.lat}&end=${b.lng},${b.lat}`;
  const res = await fetch(url);
  const json = await res.json();

  if (!json.features?.length)
    return { coords: [], distance: 0, time: 0, zero: true };

  const f = json.features[0];
  return {
    coords: f.geometry.coordinates,
    distance: (f.properties.summary.distance / 1000).toFixed(1),
    time: (f.properties.summary.duration / 3600).toFixed(1),
    zero: false,
  };
}

async function fetchHotelsAlongRoute(routeCoords) {
  if (!routeCoords || routeCoords.length === 0) return [];

  try {
    const samplePoints = [];
    const steps = 12;
    const gap = Math.floor(routeCoords.length / steps);

    for (let i = 0; i < steps; i++) {
      const idx = i * gap;
      const point = routeCoords[idx];
      if (point) {
        samplePoints.push({ lat: point[1], lng: point[0] });
      }
    }
    const endPoint = routeCoords[routeCoords.length - 1];
    if (endPoint) samplePoints.push({ lat: endPoint[1], lng: endPoint[0] });

    let queryStatements = "";
    const RADIUS = 15000;

    samplePoints.forEach((p) => {
      queryStatements += `
        node["tourism"~"hotel|guest_house"](around:${RADIUS}, ${p.lat}, ${p.lng});
      `;
    });

    const query = `
      [out:json][timeout:25];
      (
        ${queryStatements}
      );
      out body;
    `;

    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
      headers: { "Content-Type": "text/plain" },
    });

    const text = await res.text();
    if (!text || !text.trim().startsWith("{")) return [];
    const json = JSON.parse(text);

    return (json.elements || [])
      .map((e) => {
        if (!e.tags?.name) return null;
        const osmId = `osm-${e.id}`;
        return {
          _id: osmId,
          name: e.tags.name,
          lat: e.lat,
          lng: e.lon,
          type: e.tags?.tourism || "stay",
          phone: e.tags?.phone || "+91 98765 43210",
          source: "osm",
          price: getMockPrice(osmId),
          rating: getMockRating(osmId),
          images: [getMockImage(osmId)],
        };
      })
      .filter((h) => h !== null);
  } catch (e) {
    console.error("OSM Batch Fetch Failed:", e.message);
    return [];
  }
}

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!start || !end)
      return NextResponse.json(
        { error: "Start and end required" },
        { status: 400 },
      );

    const a = await geocode(start);
    const b = await geocode(end);
    const route = await getRoute(a, b);

    /* ----- Manual hotels ----- */
    const manual = await ManualHotel.find().lean();
    const manualHotels = manual
      .map((h) => {
        const idStr = h._id.toString();

        let dbImages = [];
        if (Array.isArray(h.images) && h.images.length > 0) {
          dbImages = h.images;
        } else if (
          h.image &&
          typeof h.image === "string" &&
          h.image.length > 5
        ) {
          dbImages = [h.image];
        }
        dbImages = dbImages.filter((img) => img && img.trim() !== "");
        if (dbImages.length === 0) dbImages = [getMockImage(idStr)];

        return {
          _id: idStr,
          name: h.name,
          lat: h.lat,
          lng: h.lng,
          price: h.price || 999,
          type: h.type || "stay",
          phone: h.phone || "+91 98765 43210",
          images: dbImages,
          rating: h.rating || 4.5,
          source: "manual",
        };
      })

      .filter((h) => isNearRoute(h.lat, h.lng, route.coords));

    let osmHotels = [];
    if (route.coords.length > 0) {
      osmHotels = await fetchHotelsAlongRoute(route.coords);
    }

    const seen = new Set();
    const allHotels = [...manualHotels, ...osmHotels];

    const hotels = allHotels.filter((h) => {
      if (seen.has(h._id)) return false;
      seen.add(h._id);
      return true;
    });

    return NextResponse.json({
      start,
      end,
      route: route.coords,
      distance: route.distance,
      time: route.time,
      zero: route.zero,
      hotels: hotels.slice(0, 70),
    });
  } catch (e) {
    console.error("Route API error:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
