import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token");

    if (!token) {
      return NextResponse.json({ authenticated: false, plan: null }, { status: 200 });
    }

    // Verify the token and get user data
    const decoded = verifyToken(token.value);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ authenticated: false, plan: null }, { status: 200 });
    }

    // Get user's plan from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { plan: true }
    });

    if (!user) {
      return NextResponse.json({ authenticated: false, plan: null }, { status: 200 });
    }

    const isPaid = user.plan !== "FREE";
    return NextResponse.json({ 
      authenticated: true, 
      plan: user.plan,
      isPaid 
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ authenticated: false, plan: null }, { status: 200 });
  }
}
