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
    const { key, reason, appId, type } = body;

    if (!key || !appId) {
      return NextResponse.json({ error: "License key and appId are required" }, { status: 400 });
    }

    const app = await prisma.application.findFirst({
      where: { id: appId, userId: authUser.userId }
    });

    if (!app) {
      return NextResponse.json({ error: "App not found or unauthorized" }, { status: 404 });
    }

    const license = await prisma.license.findFirst({
      where: { key, appId },
      include: { clientUsers: true }
    });

    if (!license) {
      return NextResponse.json({ error: "License key not found" }, { status: 404 });
    }

    await prisma.license.update({
      where: { id: license.id },
      data: {
        status: "BANNED",
        banReason: reason || "Banned and blacklisted by developer"
      }
    });

    let hwid = license.hwid;
    if (!hwid && license.clientUsers.length > 0) {
      const clientWithHwid = license.clientUsers.find((cu: any) => cu.hwid);
      if (clientWithHwid) {
        hwid = clientWithHwid.hwid;
      }
    }

    if (type === "ip" && hwid) {
      const record = await prisma.ipBlacklist.upsert({
        where: { ip: hwid },
        update: { reason: reason || "Banned by developer", appId },
        create: { ip: hwid, reason: reason || "Banned by developer", appId }
      });
      return NextResponse.json({ success: true, record });
    }

    if (hwid) {
      const record = await prisma.hwidBlacklist.upsert({
        where: { hwid },
        update: { reason: reason || "Banned by developer", appId },
        create: { hwid, reason: reason || "Banned by developer", appId }
      });
      return NextResponse.json({ success: true, record });
    }

    return NextResponse.json({
      success: true,
      message: "License key banned, but no bound device HWID was found to blacklist."
    });
  } catch (e) {
    console.error("Blacklist POST error:", e);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const appId = searchParams.get("appId");
    const type = searchParams.get("type");

    if (!appId) {
      return NextResponse.json({ error: "App ID is required" }, { status: 400 });
    }

    const app = await prisma.application.findFirst({
      where: { id: appId, userId: authUser.userId }
    });

    if (!app) {
      return NextResponse.json({ error: "App not found or unauthorized" }, { status: 404 });
    }

    if (type === "ip") {
      const blacklisted = await prisma.ipBlacklist.findMany({
        where: { appId }
      });
      return NextResponse.json({ success: true, blacklisted });
    }

    const blacklisted = await prisma.hwidBlacklist.findMany({
      where: { appId }
    });
    return NextResponse.json({ success: true, blacklisted });
  } catch (e) {
    console.error("Blacklist GET error:", e);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    if (type === "ip") {
      await prisma.ipBlacklist.delete({
        where: { id }
      });
      return NextResponse.json({ success: true, message: "IP unblacklisted" });
    }

    await prisma.hwidBlacklist.delete({
      where: { id }
    });
    return NextResponse.json({ success: true, message: "HWID unblacklisted" });
  } catch (e) {
    console.error("Blacklist DELETE error:", e);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
