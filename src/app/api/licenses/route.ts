import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { verifyAppOwnership, checkSubscription } from "@/lib/auth";

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("secure_auth_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

// GET all licenses for a user app
export async function GET(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const appId = searchParams.get("appId");

    if (!appId) return NextResponse.json({ error: "App ID is required" }, { status: 400 });

    // Verify ownership of the app
    const hasAccess = await verifyAppOwnership(appId, user.userId);
    if (!hasAccess) return NextResponse.json({ error: "App not found or unauthorized" }, { status: 404 });

    const licenses = await prisma.license.findMany({
      where: { appId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, licenses });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// Helper to generate custom styled licensing keys
function generateLicenseKey(prefix: string = "SECURE-"): string {
  const segment = () => crypto.randomBytes(4).toString("hex").toUpperCase();
  return `${prefix}${segment()}-${segment()}-${segment()}-${segment()}`;
}

// POST create license key
export async function POST(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const hasSub = await checkSubscription(user.userId);
    if (!hasSub) return NextResponse.json({ error: "Subscription Required" }, { status: 403 });

    const { appId, duration, amount, hwidLock, keyPattern, label } = await req.json();
    if (!appId) return NextResponse.json({ error: "App ID is required" }, { status: 400 });

    // Verify ownership of the app
    const hasAccess = await verifyAppOwnership(appId, user.userId);
    if (!hasAccess) return NextResponse.json({ error: "App not found or unauthorized" }, { status: 404 });

    const qty = amount ? Math.min(parseInt(amount), 100) : 1;
    const dur = duration || "30d";

    const createdLicenses = [];

    for (let i = 0; i < qty; i++) {
      let licenseKey: string;

      if (keyPattern && keyPattern.trim()) {
        // Replace * with random hex chars (2 chars per *)
        licenseKey = keyPattern.replace(/\*/g, () =>
          crypto.randomBytes(1).toString("hex").toUpperCase()
        );
        // Make sure the generated key is unique by appending a suffix if needed
        const exists = await prisma.license.findUnique({ where: { key: licenseKey } });
        if (exists) {
          licenseKey = keyPattern.replace(/\*/g, () =>
            crypto.randomBytes(1).toString("hex").toUpperCase()
          ) + "-" + crypto.randomBytes(2).toString("hex").toUpperCase();
        }
      } else {
        licenseKey = generateLicenseKey();
      }

      const lic = await prisma.license.create({
        data: {
          key: licenseKey,
          label: label || null,
          duration: dur,
          hwidLock: hwidLock !== undefined ? hwidLock : true,
          appId,
        },
      });
      createdLicenses.push(lic);
    }

    return NextResponse.json({ success: true, licenses: createdLicenses });
  } catch (error) {
    console.error("Create License Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
