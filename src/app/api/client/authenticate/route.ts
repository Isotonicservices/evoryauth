import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decryptAES, encryptAES, verifyRequestIntegrity } from "@/lib/security";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const { appId, appSecret, licenseKey, hwid, payload, signature } = body;

    if (!appId || !licenseKey) {
      return NextResponse.json({ error: "appId and licenseKey are required" }, { status: 400 });
    }

    const app = await prisma.application.findUnique({
      where: { id: appId },
    });

    if (!app || app.status !== "ACTIVE") {
      return NextResponse.json({ error: "Application is paused or invalid" }, { status: 403 });
    }

    if (appSecret && app.secret !== appSecret) {
      return NextResponse.json({ error: "Invalid app secret" }, { status: 403 });
    }

    if (payload && signature) {
      const decryptedText = decryptAES(payload);
      const data = JSON.parse(decryptedText);
      if (!verifyRequestIntegrity(data, signature, app.secret)) {
        return NextResponse.json({ error: "Invalid request signature" }, { status: 403 });
      }
    }

    const license = await prisma.license.findFirst({
      where: { key: licenseKey, appId },
    });

    if (!license) {
      return NextResponse.json({ error: "License key not found" }, { status: 404 });
    }

    if (license.status !== "ACTIVE") {
      return NextResponse.json({ error: "License is paused, banned, or already redeemed" }, { status: 403 });
    }

    if (license.expiresAt && new Date() > license.expiresAt) {
      return NextResponse.json({ error: "License has expired" }, { status: 403 });
    }

    if (hwid && license.hwidLock && license.hwid && license.hwid !== hwid) {
      return NextResponse.json({ error: "License is bound to a different device" }, { status: 403 });
    }

    if (hwid) {
      const blacklisted = await prisma.hwidBlacklist.findFirst({ where: { hwid, appId } });
      if (blacklisted) {
        return NextResponse.json({ error: "This device has been banned from this application." }, { status: 403 });
      }
    }

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    if (ip !== "unknown") {
      const blacklisted = await prisma.ipBlacklist.findFirst({ where: { ip } });
      if (blacklisted) {
        return NextResponse.json({ error: "This IP has been banned from this application." }, { status: 403 });
      }
    }

    await prisma.log.create({
      data: {
        action: "AUTHENTICATE",
        message: `License key ${licenseKey} authenticated successfully`,
        appId,
        hwid,
      },
    });

    const responseData = {
      success: true,
      user: {
        id: license.id,
        username: license.note || "Licensed User",
        hwid: license.hwid,
        expiresAt: license.expiresAt,
        duration: license.duration,
      },
    };

    if (payload) {
      return NextResponse.json({
        success: true,
        payload: encryptAES(JSON.stringify(responseData)),
      });
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("SDK Authentication Error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
