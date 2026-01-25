import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import Trip from "@/models/Trip";

export async function GET(req) {
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

    await connectDB();

    const trips = await Trip.find({ userId: decoded.id })
      .sort({ createdAt: -1 });

    return NextResponse.json(trips);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
