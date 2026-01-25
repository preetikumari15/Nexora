import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import Trip from "@/models/Trip";

export async function POST(req) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const token = auth.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const body = await req.json();

    await connectDB();

    const trip = await Trip.create({
      userId: decoded.id,
      start: body.start,
      end: body.end,
      distance: body.distance,
      time: body.time,
      bestStop: body.bestStop,
    });

    return NextResponse.json({ ok: true, id: trip._id });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
