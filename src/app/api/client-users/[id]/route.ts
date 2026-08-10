import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("secure_auth_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

async function verifyOwnership(clientUserId: string, authUserId: string) {
  return prisma.clientUser.findFirst({
    where: {
      id: clientUserId,
      license: { application: { userId: authUserId } },
    },
    include: { license: { include: { application: true } } },
  });
}

// PATCH - reset HWID, ban/unban client user
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const clientUserId = (await params).id;
    const clientUser = await verifyOwnership(clientUserId, authUser.userId);
    if (!clientUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();

    // Reset HWID on both clientUser and its license
    if (body.resetHwid) {
      await prisma.clientUser.update({ where: { id: clientUserId }, data: { hwid: null } });
      await prisma.license.update({ where: { id: clientUser.licenseId }, data: { hwid: null, activations: 0 } });
      return NextResponse.json({ success: true, message: "HWID reset successfully" });
    }

    // Ban / unban client user by adding/removing their HWID from blacklist
    if (body.blacklistHwid !== undefined) {
      const appId = clientUser.license.application.id;
      const hwid = clientUser.hwid || clientUser.license.hwid;

      if (!hwid) return NextResponse.json({ error: "No HWID found for this user" }, { status: 400 });

      if (body.blacklistHwid) {
        // Add to blacklist
        await prisma.hwidBlacklist.upsert({
          where: { hwid },
          update: { reason: body.reason || "Banned by admin", appId },
          create: { hwid, reason: body.reason || "Banned by admin", appId },
        });
      } else {
        // Remove from blacklist
        await prisma.hwidBlacklist.deleteMany({ where: { hwid } });
      }
      return NextResponse.json({ success: true, blacklisted: body.blacklistHwid });
    }

    return NextResponse.json({ error: "No action specified" }, { status: 400 });
  } catch (e) {
    console.error("Client user PATCH error:", e);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// DELETE - delete client user
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const clientUserId = (await params).id;
    const clientUser = await verifyOwnership(clientUserId, authUser.userId);
    if (!clientUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await prisma.clientUser.delete({ where: { id: clientUserId } });
    return NextResponse.json({ success: true, message: "User deleted" });
  } catch (e) {
    console.error("Client user DELETE error:", e);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
