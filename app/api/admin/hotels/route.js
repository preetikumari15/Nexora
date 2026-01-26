import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import ManualHotel from "@/models/ManualHotel";

function auth(req) {
  const auth = req.headers.get("authorization");
  if (!auth) throw new Error("Unauthorized");
  const token = auth.replace("Bearer ", "");
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.role !== "admin") throw new Error("Unauthorized");
}

export async function GET(req) {
  try {
    auth(req);
    await connectDB();
    const hotels = await ManualHotel.find().sort({ createdAt: -1 });
    return NextResponse.json(hotels);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}

export async function POST(req) {
  try {
    auth(req);
    const body = await req.json();
    await connectDB();
    const h = await ManualHotel.create(body);
    return NextResponse.json(h);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}

export async function DELETE(req) {
  try {
    auth(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    await connectDB();
    await ManualHotel.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}
