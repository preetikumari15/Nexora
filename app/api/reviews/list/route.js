import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Review from "@/models/Review";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const hotelId = searchParams.get("hotelId");

    await connectDB();

    const reviews = await Review.find({ hotelId });

    const avg =
      reviews.reduce((s, r) => s + r.rating, 0) /
      (reviews.length || 1);

    return NextResponse.json({
      avg: Number(avg.toFixed(1)),
      count: reviews.length,
      reviews,
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
