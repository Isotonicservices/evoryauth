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

// PATCH - update user role, status, plan
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const me = await prisma.user.findUnique({ where: { id: authUser.userId } });
    if (!me || me.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const targetId = (await params).id;
    if (targetId === authUser.userId) {
      return NextResponse.json({ error: "Cannot modify your own account" }, { status: 400 });
    }

    const body = await req.json();
    const updateData: Record<string, string> = {};

    if (body.role && ["USER", "ADMIN"].includes(body.role)) updateData.role = body.role;
    if (body.status && ["ACTIVE", "BANNED"].includes(body.status)) updateData.status = body.status;
    if (body.plan && ["FREE", "BASIC", "PRO", "ENTERPRISE"].includes(body.plan)) updateData.plan = body.plan;

    const updated = await prisma.user.update({
      where: { id: targetId },
      data: updateData,
      select: { id: true, username: true, role: true, status: true, plan: true },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("User PATCH Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// DELETE - remove a user
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const me = await prisma.user.findUnique({ where: { id: authUser.userId } });
    if (!me || me.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const targetId = (await params).id;
    if (targetId === authUser.userId) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    await prisma.user.delete({ where: { id: targetId } });
    return NextResponse.json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("User DELETE Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
