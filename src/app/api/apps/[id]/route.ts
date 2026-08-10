import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
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

    const appId = (await params).id;

    // Verify ownership
    const hasAccess = await verifyAppOwnership(appId, user.userId);
    if (!hasAccess) return NextResponse.json({ error: "App not found or unauthorized" }, { status: 404 });

    await prisma.application.delete({
      where: { id: appId },
    });

    return NextResponse.json({ success: true, message: "App deleted successfully" });
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

    const appId = (await params).id;
    const body = await req.json();

    // Verify ownership
    const hasAccess = await verifyAppOwnership(appId, user.userId);
    if (!hasAccess) return NextResponse.json({ error: "App not found or unauthorized" }, { status: 404 });

    const updateData: Record<string, boolean | string> = {};
    if (body.status) updateData.status = body.status; // ACTIVE or PAUSED
    if (body.hwidLock !== undefined) updateData.hwidLock = body.hwidLock;
    if (body.encryption !== undefined) updateData.encryption = body.encryption;
    if (body.version) updateData.version = body.version;
    if (body.resetSecret) updateData.secret = crypto.randomUUID();

    const updatedApp = await prisma.application.update({
      where: { id: appId },
      data: updateData,
    });

    return NextResponse.json({ success: true, app: updatedApp });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
