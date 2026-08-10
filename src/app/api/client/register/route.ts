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

    // Decrypt the payload
    const decryptedText = decryptAES(payload);
    const data = JSON.parse(decryptedText);

    const { username, password, licenseKey, hwid } = data;

    if (hwid) {
      const blacklisted = await prisma.hwidBlacklist.findUnique({ where: { hwid } });
      if (blacklisted) {
        return NextResponse.json({ error: "This device has been banned from this application." }, { status: 403 });
      }
    }

    if (!username || !password || !licenseKey) {
      return NextResponse.json({ error: "Missing required registration parameters" }, { status: 400 });
    }

    // Validate license key
    const license = await prisma.license.findFirst({
      where: { key: licenseKey, appId },
    });

    if (!license) {
      return NextResponse.json({ error: "License key is invalid for this application" }, { status: 404 });
    }

    if (license.status !== "ACTIVE") {
      return NextResponse.json({ error: "License key is not active, paused, or banned" }, { status: 403 });
    }

    if (license.activations >= license.activationLimit) {
      return NextResponse.json({ error: "License activations limit exceeded" }, { status: 403 });
    }

    // Check if client username is already registered on this license
    const existingClientUser = await prisma.clientUser.findFirst({
      where: { username, licenseId: license.id },
    });

    if (existingClientUser) {
      return NextResponse.json({ error: "Username already registered under this license" }, { status: 400 });
    }

    // Hash user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Register user
    const clientUser = await prisma.clientUser.create({
      data: {
        username,
        password: hashedPassword,
        hwid,
        licenseId: license.id,
      },
    });

    // Update license activation status
    await prisma.license.update({
      where: { id: license.id },
      data: {
        activations: license.activations + 1,
        hwid: license.hwidLock && !license.hwid ? hwid : license.hwid,
      },
    });

    // Log successful registration
    await prisma.log.create({
      data: {
        action: "REGISTER",
        message: `Registered client user ${username} using license ${licenseKey}`,
        appId,
        hwid,
      },
    });

    const successResponse = {
      success: true,
      message: "User registered successfully.",
      user: { username: clientUser.username },
    };

    return NextResponse.json({
      success: true,
      payload: encryptAES(JSON.stringify(successResponse)),
    });
  } catch (error) {
    console.error("SDK Registration Error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
