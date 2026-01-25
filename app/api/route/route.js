import { NextResponse } from "next/server";

const KEY = process.env.GOOGLE_MAPS_KEY;

// Convert Google encoded polyline to [lng, lat] pairs
function decodePolyline(encoded) {
  let index = 0,
    lat = 0,
    lng = 0,
    coordinates = [];

  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) ? ~(result >> 1) : result >> 1;
    lng += dlng;

    coordinates.push([lng / 1e5, lat / 1e5]);
  }

  return coordinates; // [lng, lat]
}

async function geocode(place) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    place
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
  };
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!start || !end) {
      return NextResponse.json(
        { error: "Start and End are required" },
        { status: 400 }
      );
    }

    const a = await geocode(start);
    const b = await geocode(end);

    const r = await getRoute(a, b);

    return NextResponse.json({
      start,
      end,
      distance: r.distance,
      time: r.time,
      route: r.route, // [ [lng, lat], ... ]
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
