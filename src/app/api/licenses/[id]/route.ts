import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { verifyAppOwnership } from "@/lib/auth";

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("secure_auth_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const licenseId = (await params).id;

    // Verify ownership of the license via application relationship
    const license = await prisma.license.findFirst({
      where: { id: licenseId },
      include: { application: true }
    });

    if (!license) return NextResponse.json({ error: "License not found" }, { status: 404 });

    const hasAccess = await verifyAppOwnership(license.appId, user.userId);
    if (!hasAccess) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    await prisma.license.delete({
      where: { id: licenseId },
    });

    return NextResponse.json({ success: true, message: "License deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const licenseId = (await params).id;
    const body = await req.json();

    const license = await prisma.license.findFirst({
      where: { id: licenseId },
      include: { application: true }
    });

    if (!license) return NextResponse.json({ error: "License not found" }, { status: 404 });

    const hasAccess = await verifyAppOwnership(license.appId, user.userId);
    if (!hasAccess) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const updateData: Record<string, boolean | string | number | null | Date> = {};
    
    if (body.resetHwid) {
      updateData.hwid = null;
      updateData.activations = 0;
    }
    
    if (body.status) {
      updateData.status = body.status; // ACTIVE, PAUSED, BANNED
      if (body.status === "BANNED") {
        updateData.bannedAt = new Date();
        updateData.banReason = body.banReason || "No reason provided";
      } else {
        updateData.bannedAt = null;
        updateData.banReason = null;
      }
    }

    if (body.hwidLock !== undefined) {
      updateData.hwidLock = body.hwidLock;
    }

    const updatedLicense = await prisma.license.update({
      where: { id: licenseId },
      data: updateData,
    });

    return NextResponse.json({ success: true, license: updatedLicense });
  } catch (error) {
    console.error("Update License Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
