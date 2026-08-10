import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

// Middleware helper to ensure user is full ADMIN
async function ensureAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("secure_auth_token")?.value;
  if (!token) return null;

  const userPayload = verifyToken(token);
  if (!userPayload) return null;

  const user = await prisma.user.findUnique({
    where: { id: userPayload.userId }
  });

  if (!user || user.role !== "ADMIN") return null;
  return user;
}

export async function GET(req: Request) {
  try {
    const admin = await ensureAdmin();
    if (!admin) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: search } },
          { username: { contains: search } }
        ]
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        plan: true,
        subscriptionEnd: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await ensureAdmin();
    if (!admin) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { userId, role, plan, addDays } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID required" }, { status: 400 });
    }

    const updateData: any = {};
    if (role) updateData.role = role;
    if (plan) {
      updateData.plan = plan;
      
      if (plan === "FREE") {
        updateData.subscriptionEnd = new Date(0); // expired
      } else if (plan === "BASIC") {
        // BASIC = 30 days from now
        const end = new Date();
        end.setDate(end.getDate() + 30);
        updateData.subscriptionEnd = end;
      } else if (plan === "PRO") {
        // PRO = 365 days from now
        const end = new Date();
        end.setDate(end.getDate() + 365);
        updateData.subscriptionEnd = end;
      }
    }

    if (addDays) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        let currentEnd = user.subscriptionEnd ? new Date(user.subscriptionEnd) : new Date();
        if (currentEnd < new Date()) currentEnd = new Date();
        
        currentEnd.setDate(currentEnd.getDate() + addDays);
        updateData.subscriptionEnd = currentEnd;
        
        // If adding days and no plan is set, default to BASIC
        if (!user.plan || user.plan === "FREE") {
           updateData.plan = "BASIC";
        }
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
  }
}
