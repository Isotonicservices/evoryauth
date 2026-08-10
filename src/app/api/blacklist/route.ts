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

export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { key, reason, appId } = body;

    if (!key || !appId) {
      return NextResponse.json({ error: "License key and appId are required" }, { status: 400 });
    }

    // Verify ownership of the app
    const app = await prisma.application.findFirst({
      where: { id: appId, userId: authUser.userId }
    });

    if (!app) {
      return NextResponse.json({ error: "App not found or unauthorized" }, { status: 404 });
    }

    // Find the license key
    const license = await prisma.license.findFirst({
      where: { key, appId },
      include: { clientUsers: true }
    });

    if (!license) {
      return NextResponse.json({ error: "License key not found" }, { status: 404 });
    }

    // Find HWID to blacklist. Check license first, then associated clientUsers.
    let hwid = license.hwid;
    if (!hwid && license.clientUsers.length > 0) {
      const clientWithHwid = license.clientUsers.find(cu => cu.hwid);
      if (clientWithHwid) {
        hwid = clientWithHwid.hwid;
      }
    }

    // Ban the license key itself
    await prisma.license.update({
      where: { id: license.id },
      data: {
        status: "BANNED",
        banReason: reason || "Banned and blacklisted by developer"
      }
    });

    if (!hwid) {
      return NextResponse.json({
        success: true,
        message: "License key banned, but no bound device HWID was found to blacklist."
      });
    }

    const record = await prisma.hwidBlacklist.upsert({
      where: { hwid },
      update: { reason: reason || "Banned by developer", appId },
      create: { hwid, reason: reason || "Banned by developer", appId }
    });

    return NextResponse.json({ success: true, record });
  } catch (e) {
    console.error("Blacklist POST error:", e);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
