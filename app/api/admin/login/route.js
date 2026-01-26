import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import Admin from "@/models/Admin";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    await connectDB();

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return NextResponse.json({ error: "Invalid" }, { status: 400 });
    }

    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) {
      return NextResponse.json({ error: "Invalid" }, { status: 400 });
    }

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json({ token });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
