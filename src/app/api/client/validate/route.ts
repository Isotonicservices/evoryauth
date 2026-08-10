import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decryptAES, encryptAES } from "@/lib/security";

export async function POST(req: Request) {
  try {
    const { appId, payload } = await req.json();

    if (!appId || !payload) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const app = await prisma.application.findUnique({
      where: { id: appId },
    });

    if (!app || app.status !== "ACTIVE") {
      return NextResponse.json({ error: "Application is paused or invalid" }, { status: 403 });
    }

    // Decrypt parameters
    const decryptedText = decryptAES(payload);
    const data = JSON.parse(decryptedText);

    const { key, hwid } = data;

    if (hwid) {
      const blacklisted = await prisma.hwidBlacklist.findUnique({ where: { hwid } });
      if (blacklisted) {
        return NextResponse.json({ success: false, error: "This device has been banned from this application." }, { status: 403 });
      }
    }

    if (!key) {
      return NextResponse.json({ error: "License key is required for validation" }, { status: 400 });
    }

    const license = await prisma.license.findFirst({
      where: { key, appId },
    });

    if (!license) {
      return NextResponse.json({ error: "License not found" }, { status: 404 });
    }

    if (license.status !== "ACTIVE") {
      return NextResponse.json({
        success: false,
        error: `License status is ${license.status}. ${license.banReason || ""}`,
      }, { status: 403 });
    }

    // Check expiration
    if (license.expiresAt && new Date() > license.expiresAt) {
      await prisma.license.update({
        where: { id: license.id },
        data: { status: "EXPIRED" },
      });
      return NextResponse.json({ success: false, error: "License key has expired" }, { status: 403 });
    }

    // Check HWID Lock
    if (app.hwidLock && license.hwidLock && license.hwid && license.hwid !== hwid) {
      return NextResponse.json({ success: false, error: "HWID mismatch detected" }, { status: 403 });
    }

    const successResponse = {
      success: true,
      message: "License validated successfully.",
      expiresAt: license.expiresAt,
    };

    return NextResponse.json({
      success: true,
      payload: encryptAES(JSON.stringify(successResponse)),
    });
  } catch (error) {
    console.error("SDK Validation Error:", error);
    return NextResponse.json({ error: "Validation failed" }, { status: 500 });
  }
}
