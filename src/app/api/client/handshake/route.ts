import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encryptAES, generateRSAKeyPair, encryptRSA, generateSessionToken } from "@/lib/security";
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

    const rsaKeyPair = generateRSAKeyPair();
    const sessionToken = generateSessionToken();
    const clientKey = crypto.randomBytes(32).toString("hex");

    const responsePayload = {
      sessionId: sessionToken,
      serverPublicKey: rsaKeyPair.publicKey,
      tempKey: clientKey,
      encryption: app.encryption,
      version: app.version,
      timestamp: Date.now()
    };

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

