import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { verifyAppOwnership } from "@/lib/auth";
import { getUserDirById, saveFileToUserDir } from "@/lib/userStorage";

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("secure_auth_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const appId = searchParams.get("appId");

    if (!appId) return NextResponse.json({ error: "App ID is required" }, { status: 400 });

    const hasAccess = await verifyAppOwnership(appId, user.userId);
    if (!hasAccess) return NextResponse.json({ error: "App not found or unauthorized" }, { status: 404 });

    const files = await prisma.file.findMany({
      where: { appId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, files });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const appId = formData.get("appId") as string;
    const version = (formData.get("version") as string) || "1.0";
    const file = formData.get("file") as File;

    if (!appId || !file) {
      return NextResponse.json({ error: "Missing appId or file payload" }, { status: 400 });
    }

    const hasAccess = await verifyAppOwnership(appId, user.userId);
    if (!hasAccess) return NextResponse.json({ error: "App not found or unauthorized" }, { status: 404 });

    // 1. Create file record in DB and save binary data
    const buffer = Buffer.from(await file.arrayBuffer());
    const dbFile = await prisma.file.create({
      data: {
        name: file.name,
        size: file.size,
        path: `/api/files/download?fileId=`, // placeholder
        version,
        appId,
        fileData: buffer,
      },
    });

    // 2. Fallback: Save file binary contents to the user's specific files directory for local testing
    const userDir = await getUserDirById(user.userId);
    if (userDir) {
      saveFileToUserDir(userDir, dbFile.id, file.name, buffer);
    }

    // 3. Update paths
    const updatedFile = await prisma.file.update({
      where: { id: dbFile.id },
      data: {
        path: `/api/files/download?fileId=${dbFile.id}`
      }
    });

    return NextResponse.json({ success: true, file: updatedFile });
  } catch (error) {
    console.error("Create File CDN record error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
