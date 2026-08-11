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

    const { key, hwid, ip } = data;

    if (!key) {
      return NextResponse.json({ error: "License key is required" }, { status: 400 });
    }

    if (ip) {
      const blacklisted = await prisma.ipBlacklist.findFirst({ where: { ip } });
      if (blacklisted) {
        return NextResponse.json({ error: "This IP has been banned from this application." }, { status: 403 });
      }
    }

    const license = await prisma.license.findFirst({
      where: { key, appId },
    });

    if (!license) {
      return NextResponse.json({ error: "License key not found" }, { status: 404 });
    }

    if (license.status !== "ACTIVE") {
      return NextResponse.json({ error: "License is paused, banned, or already redeemed" }, { status: 403 });
    }

    if (license.activations >= license.activationLimit) {
      return NextResponse.json({ error: "License key already activated maximum times" }, { status: 403 });
    }

    if (hwid) {
      const blacklisted = await prisma.hwidBlacklist.findFirst({ where: { hwid, appId } });
      if (blacklisted) {
        return NextResponse.json({ error: "This device has been banned from this application." }, { status: 403 });
      }
    }

    let expiryDate: Date | null = null;
    if (license.duration !== "lifetime") {
      const days = parseInt(license.duration) || 30;
      expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + days);
    }

    const updatedLicense = await prisma.license.update({
      where: { id: license.id },
      data: {
        activations: license.activations + 1,
        expiresAt: expiryDate,
        hwid: license.hwidLock && !license.hwid ? hwid : license.hwid,
      },
    });

    await prisma.log.create({
      data: {
        action: "ACTIVATE",
        message: `License key ${key} activated successfully`,
        appId,
        hwid,
      },
    });

    const successResponse = {
      success: true,
      message: "License activated successfully.",
      license: {
        key: updatedLicense.key,
        expiresAt: updatedLicense.expiresAt,
        duration: updatedLicense.duration,
      },
    };

    return NextResponse.json({
      success: true,
      payload: encryptAES(JSON.stringify(successResponse)),
    });
  } catch (error) {
    console.error("SDK Activation Error:", error);
    return NextResponse.json({ error: "Activation failed" }, { status: 500 });
  }
}
