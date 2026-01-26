import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import Review from "@/models/Review";

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

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { hotelId, rating, comment } = body;

    if (!hotelId || !rating) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    await connectDB();

    await Review.create({
      userId: decoded.id,
      hotelId,
      rating: Number(rating),
      comment: comment || "",
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Review API error:", e);
    return NextResponse.json(
      { error: "Server error while adding review" },
      { status: 500 }
    );
  }
}

