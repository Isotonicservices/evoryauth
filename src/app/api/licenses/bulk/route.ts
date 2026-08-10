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

// DELETE all licenses for an app
export async function DELETE(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const appId = searchParams.get("appId");
    if (!appId) return NextResponse.json({ error: "appId required" }, { status: 400 });

    const app = await prisma.application.findFirst({ where: { id: appId, userId: user.userId } });
    if (!app) return NextResponse.json({ error: "App not found" }, { status: 404 });

    const { count } = await prisma.license.deleteMany({ where: { appId } });
    return NextResponse.json({ success: true, deleted: count });
  } catch (e) {
    console.error("Bulk delete error:", e);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
