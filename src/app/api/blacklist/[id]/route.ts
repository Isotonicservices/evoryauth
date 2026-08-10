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

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const blacklistId = (await params).id;
    const blacklistRecord = await prisma.hwidBlacklist.findUnique({
      where: { id: blacklistId }
    });

    if (!blacklistRecord) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    // Check if the developer owns the application of this blacklist record
    const app = await prisma.application.findFirst({
      where: { id: blacklistRecord.appId, userId: authUser.userId }
    });

    if (!app) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.hwidBlacklist.delete({ where: { id: blacklistId } });
    return NextResponse.json({ success: true, message: "HWID unblacklisted successfully" });
  } catch (e) {
    console.error("Blacklist DELETE error:", e);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
