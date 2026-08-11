import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decryptAES, encryptAES, verifyRequestIntegrity } from "@/lib/security";

export async function POST(req: Request) {
  try {
    const { appId, payload, signature } = await req.json();

    if (!appId || !payload || !signature) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const app = await prisma.application.findUnique({
      where: { id: appId },
    });

    if (!app || app.status !== "ACTIVE") {
      return NextResponse.json({ error: "Application is paused or invalid" }, { status: 403 });
    }

    const decryptedText = decryptAES(payload);
    const data = JSON.parse(decryptedText);

    if (!verifyRequestIntegrity(data, signature, app.secret)) {
      return NextResponse.json({ error: "Invalid request signature" }, { status: 403 });
    }

    const { key, hwid, ip, checksum } = data;

    if (ip) {
      const blacklisted = await prisma.ipBlacklist.findFirst({ where: { ip } });
      if (blacklisted) {
        return NextResponse.json({ success: false, error: "This IP has been banned from this application." }, { status: 403 });
      }
    }

    if (hwid) {
      const blacklisted = await prisma.hwidBlacklist.findUnique({ where: { hwid } });
      if (blacklisted) {
        return NextResponse.json({ success: false, error: "This device has been banned from this application." }, { status: 403 });
      }
    }

    const license = await prisma.license.findFirst({
      where: { key, appId },
    });

    if (!license) {
      return NextResponse.json({ error: "License not found" }, { status: 404 });
    }

    if (license.status !== "ACTIVE") {
      return NextResponse.json({ success: false, error: "License is not active" }, { status: 403 });
    }

    if (license.expiresAt && new Date() > license.expiresAt) {
      await prisma.license.update({
        where: { id: license.id },
        data: { status: "EXPIRED" },
      });
      return NextResponse.json({ success: false, error: "License has expired" }, { status: 403 });
    }

    if (app.hwidLock && license.hwidLock && license.hwid && license.hwid !== hwid) {
      return NextResponse.json({ success: false, error: "HWID mismatch detected" }, { status: 403 });
    }

    const nextHeartbeat = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 300) + 60;

    const successResponse = {
      success: true,
      nextHeartbeat,
      expiresAt: license.expiresAt,
    };

    return NextResponse.json({
      success: true,
      payload: encryptAES(JSON.stringify(successResponse)),
    });
  } catch (error) {
    console.error("SDK Heartbeat Error:", error);
    return NextResponse.json({ error: "Heartbeat failed" }, { status: 500 });
  }
}
