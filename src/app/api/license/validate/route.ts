import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { key, hwid, ip, name, ownerid, secret, version } = body;

    if (!key || !secret) {
      return NextResponse.json({ success: false, error: "Missing key or secret" }, { status: 400 });
    }

    // 1. Verify app exists and is active
    const app = await prisma.application.findFirst({
      where: {
        secret,
        name,
        user: { id: ownerid }
      }
    });

    if (!app || app.status !== "ACTIVE") {
      return NextResponse.json({ success: false, error: "Application invalid or inactive" }, { status: 403 });
    }

    // 2. HWID Blacklist check
    if (hwid) {
      const blacklisted = await prisma.hwidBlacklist.findUnique({ where: { hwid } });
      if (blacklisted) {
        return NextResponse.json({ success: false, error: "This device has been banned." }, { status: 403 });
      }
    }

    // 3. Find license
    const license = await prisma.license.findFirst({
      where: { key, appId: app.id }
    });

    if (!license) {
      return NextResponse.json({ success: false, error: "License key not found" }, { status: 404 });
    }

    if (license.status !== "ACTIVE") {
      return NextResponse.json({ success: false, error: `License key status is ${license.status}.` }, { status: 403 });
    }

    // 4. Check expiration
    if (license.expiresAt && new Date() > license.expiresAt) {
      await prisma.license.update({ where: { id: license.id }, data: { status: "EXPIRED" } });
      return NextResponse.json({ success: false, error: "License key has expired" }, { status: 403 });
    }

    // 5. HWID Locking / Binding
    if (app.hwidLock && license.hwidLock) {
      if (license.hwid && license.hwid !== hwid) {
        return NextResponse.json({ success: false, error: "HWID mismatch. Reset HWID on dashboard." }, { status: 403 });
      }

      // Auto bind HWID if not set
      if (!license.hwid && hwid) {
        await prisma.license.update({
          where: { id: license.id },
          data: { hwid, activations: license.activations + 1 }
        });
      }
    }

    // 6. Create or update clientUser record
    let clientUser = await prisma.clientUser.findFirst({
      where: { username: key, licenseId: license.id }
    });

    if (!clientUser) {
      clientUser = await prisma.clientUser.create({
        data: {
          username: key,
          password: "", 
          hwid,
          ip: ip || "127.0.0.1",
          licenseId: license.id
        }
      });
    } else {
      await prisma.clientUser.update({
        where: { id: clientUser.id },
        data: {
          lastLogin: new Date(),
          ip: ip || clientUser.ip,
          hwid: hwid || clientUser.hwid
        }
      });
    }

    // 7. Log action
    await prisma.log.create({
      data: {
        action: "LOGIN",
        message: `Key validation successful for key ${key}`,
        appId: app.id,
        hwid
      }
    });

    // Send successful response matching auth.hpp parser
    // The "name" field is the subscription/game name - it comes from the license label
    // When creating a license in the dashboard, set the label to: fortnite, csgo, valorant, etc.
    return NextResponse.json({
      success: true,
      name: license.label || "unlock", 
      expiry: license.expiresAt ? license.expiresAt.toISOString() : "lifetime"
    });
  } catch (error) {
    console.error("License validate error:", error);
    return NextResponse.json({ success: false, error: "Server validation failed" }, { status: 500 });
  }
}
