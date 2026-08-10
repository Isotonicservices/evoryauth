import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("secure_auth_token")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        plan: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user || user.status === "BANNED") {
      return NextResponse.json({ authenticated: false }, { status: 403 });
    }

    return NextResponse.json({ authenticated: true, user });
  } catch (error) {
    console.error("Dashboard auth check error:", error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
