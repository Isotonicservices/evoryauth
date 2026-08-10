import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";
import { rateLimit } from "@/lib/redis";
import { ensureUserDirectory } from "@/lib/userStorage";

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const limiter = await rateLimit(`login:${ip}`, 10, 60 * 1000);
    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429 }
      );
    }

    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
    }


    // 2. Fetch User
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
    }

    if (user.status === "BANNED") {
      return NextResponse.json({ error: "This account has been banned." }, { status: 403 });
    }

    // 3. Password Verification
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
    }

    // 4. Generate JWT
    const token = signToken({
      userId: user.id,
      username: user.username,
      role: user.role,
      plan: user.plan,
    });

    // 5. Build response with cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        plan: user.plan,
      },
    });

    response.cookies.set("secure_auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    try { ensureUserDirectory({ email: user.email, username: user.username, role: user.role, plan: user.plan, id: user.id, password }); } catch(e) {}

    return response;
  } catch (error) {
    console.error("Dashboard Login Error:", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
