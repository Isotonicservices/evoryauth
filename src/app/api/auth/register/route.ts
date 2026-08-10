import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/redis";
import { ensureUserDirectory } from "@/lib/userStorage";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const limiter = await rateLimit(`register:${ip}`, 5, 60 * 1000);
    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      );
    }

    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    if (username.length < 3 || password.length < 6) {
      return NextResponse.json(
        { error: "Username must be at least 3 chars and password 6 chars long." },
        { status: 400 }
      );
    }

    // Check if user or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username or email is already taken." },
        { status: 400 }
      );
    }

    // First user is automatically system administrator
    const usersCount = await prisma.user.count();
    const assignedRole = usersCount === 0 ? "ADMIN" : "USER";
    const assignedPlan = usersCount === 0 ? "ENTERPRISE" : "FREE";

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: assignedRole,
        plan: assignedPlan,
      },
    });

    // Create user directory on disk (skip on Vercel/serverless)
    try {
      if (process.env.VERCEL !== "1") {
        ensureUserDirectory({
          email: newUser.email,
          username: newUser.username,
          role: newUser.role,
          plan: newUser.plan,
          id: newUser.id,
          password,
        });
      }
    } catch (e) {
      console.error("Failed to create user directory:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Account registered successfully.",
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        plan: newUser.plan,
      },
    });
  } catch (error) {
    console.error("Dashboard Register Error:", error);
    return NextResponse.json({ error: "An unexpected error occurred.", details: String(error) }, { status: 500 });
  }
}
