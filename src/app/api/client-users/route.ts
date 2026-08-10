import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("secure_auth_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

// GET - list client users (people who used a license) for an app
export async function GET(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const appId = searchParams.get("appId");
    if (!appId) return NextResponse.json({ error: "appId required" }, { status: 400 });

    const app = await prisma.application.findFirst({ where: { id: appId, userId: user.userId } });
    if (!app) return NextResponse.json({ error: "App not found" }, { status: 404 });

    const clientUsers = await prisma.clientUser.findMany({
      where: { license: { appId } },
      include: {
        license: {
          select: {
            key: true,
            label: true,
            duration: true,
            expiresAt: true,
            status: true,
            hwid: true,
            hwidLock: true,
          },
        },
      },
      orderBy: { lastLogin: "desc" },
    });

    const blacklist = await prisma.hwidBlacklist.findMany({
      where: { appId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, clientUsers, blacklist });
  } catch (e) {
    console.error("Client users GET error:", e);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
