import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encryptAES } from "@/lib/security";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { appId } = await req.json();

    if (!appId) {
      return NextResponse.json({ error: "App ID is required" }, { status: 400 });
    }

    const app = await prisma.application.findFirst({
      where: { name: appId },
    });

    if (!app || app.status !== "ACTIVE") {
      return NextResponse.json({ error: "Application is disabled or not found." }, { status: 403 });
    }

    // Generate temporary verification session parameters
    const tempSessionId = crypto.randomBytes(16).toString("hex");
    const clientKey = crypto.randomBytes(16).toString("hex"); // 128 bit temp key

    // Formulate dynamic initialization handshake payload
    const responsePayload = {
      sessionId: tempSessionId,
      tempKey: clientKey,
      encryption: app.encryption,
      version: app.version,
    };

    // Encrypt response using general SDK secret if enabled
    const encryptedBody = encryptAES(JSON.stringify(responsePayload));

    return NextResponse.json({
      success: true,
      payload: encryptedBody,
    });
  } catch (error) {
    console.error("SDK Handshake Error:", error);
    return NextResponse.json({ error: "Handshake failed" }, { status: 500 });
  }
}

