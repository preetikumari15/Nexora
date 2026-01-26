import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import Admin from "@/models/Admin";

export async function POST(req) {
  try {
    const { email, password, secret } = await req.json();

    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const existing = await Admin.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "Admin already exists" }, { status: 400 });
    }

    const hash = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      email,
      password: hash,
    });

    return NextResponse.json({ ok: true, email: admin.email });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
