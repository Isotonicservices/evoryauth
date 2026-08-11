import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decryptAES, encryptAES, verifyRequestIntegrity, calculateIntegrityChecksum } from "@/lib/security";

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

    const { key, checksum } = data;

    if (!key) {
      return NextResponse.json({ error: "License key is required" }, { status: 400 });
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

    if (checksum) {
      const serverChecksum = calculateIntegrityChecksum(JSON.stringify({ key, appId }));
      if (checksum !== serverChecksum) {
        await prisma.log.create({
          data: {
            action: "INTEGRITY_CHECK_FAILED",
            message: `Checksum mismatch for license ${key}`,
            appId,
          },
        });
        return NextResponse.json({ success: false, error: "Integrity check failed" }, { status: 403 });
      }
    }

    const successResponse = {
      success: true,
      message: "Integrity verified successfully",
    };

    return NextResponse.json({
      success: true,
      payload: encryptAES(JSON.stringify(successResponse)),
    });
  } catch (error) {
    console.error("SDK Integrity Error:", error);
    return NextResponse.json({ error: "Integrity check failed" }, { status: 500 });
  }
}
