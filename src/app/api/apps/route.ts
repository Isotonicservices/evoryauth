import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { getAccessibleApps, checkSubscription } from "@/lib/auth";

// Helper to authenticate user
async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("secure_auth_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

// GET all apps for user
export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const apps = await getAccessibleApps(user.userId);

    return NextResponse.json({ success: true, apps });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// POST create app
export async function POST(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const hasSub = await checkSubscription(user.userId);
    if (!hasSub) return NextResponse.json({ error: "Subscription Required" }, { status: 403 });

    const { name, version, hwidLock } = await req.json();
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const secret = crypto.randomUUID();

    const app = await prisma.application.create({
      data: {
        name,
        version: version || "1.0",
        hwidLock: hwidLock !== undefined ? hwidLock : true,
        secret,
        userId: user.userId,
      },
    });

    return NextResponse.json({ success: true, app });
  } catch (error) {
    console.error("Create application error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
