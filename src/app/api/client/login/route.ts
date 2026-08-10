import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decryptAES, encryptAES } from "@/lib/security";
import bcrypt from "bcryptjs";

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

    const { username, password, hwid } = data;

    if (hwid) {
      const blacklisted = await prisma.hwidBlacklist.findUnique({ where: { hwid } });
      if (blacklisted) {
        return NextResponse.json({ error: "This device has been banned from this application." }, { status: 403 });
      }
    }

    if (!username || !password) {
      return NextResponse.json({ error: "Missing login credentials" }, { status: 400 });
    }

    // Find user across application licenses
    const clientUser = await prisma.clientUser.findFirst({
      where: {
        username,
        license: { appId },
      },
      include: {
        license: true,
      },
    });

    if (!clientUser) {
      return NextResponse.json({ error: "Invalid credentials or user does not exist" }, { status: 401 });
    }

    const license = clientUser.license;

    if (license.status !== "ACTIVE") {
      return NextResponse.json({ error: "License attached to user is paused or banned" }, { status: 403 });
    }

    // Verify Password
    const isPasswordValid = await bcrypt.compare(password, clientUser.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Verify HWID binding
    if (app.hwidLock && license.hwidLock) {
      if (license.hwid && license.hwid !== hwid) {
        return NextResponse.json({ error: "HWID mismatch. Reset HWID on dashboard." }, { status: 403 });
      }
      
      // Auto bind HWID if not set
      if (!license.hwid && hwid) {
        await prisma.license.update({
          where: { id: license.id },
          data: { hwid },
        });
      }
    }

    // Log login action
    await prisma.log.create({
      data: {
        action: "LOGIN",
        message: `Client user ${username} logged in successfully`,
        appId,
        hwid,
      },
    });

    // Update last login
    await prisma.clientUser.update({
      where: { id: clientUser.id },
      data: { lastLogin: new Date(), hwid },
    });

    const successResponse = {
      success: true,
      message: "Login successful.",
      sessionToken: crypto.randomUUID(),
      license: {
        key: license.key,
        duration: license.duration,
        expiresAt: license.expiresAt,
      },
    };

    return NextResponse.json({
      success: true,
      payload: encryptAES(JSON.stringify(successResponse)),
    });
  } catch (error) {
    console.error("SDK Client Login Error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
