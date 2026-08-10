import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
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

    const fileId = (await params).id;

    const file = await prisma.file.findFirst({
      where: { id: fileId },
      include: { application: true }
    });

    if (!file) return NextResponse.json({ error: "File not found" }, { status: 404 });

    const hasAccess = await verifyAppOwnership(file.appId, user.userId);
    if (!hasAccess) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    // Delete file from disk
    const filePath = path.join(process.cwd(), "uploads", fileId);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.error("Failed to delete file from disk:", e);
      }
    }

    await prisma.file.delete({
      where: { id: fileId },
    });

    return NextResponse.json({ success: true, message: "File removed from CDN" });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const fileId = (await params).id;

    const dbFile = await prisma.file.findFirst({
      where: { id: fileId },
    });

    if (!dbFile) return NextResponse.json({ error: "File not found" }, { status: 404 });

    const hasAccess = await verifyAppOwnership(dbFile.appId, user.userId);
    if (!hasAccess) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const version = formData.get("version") as string;

    if (!file) {
      return NextResponse.json({ error: "Missing file payload" }, { status: 400 });
    }

    // Save file binary contents to local uploads folder (overwriting old one) for local testing
    const uploadsDir = path.join(process.cwd(), "uploads");
    const filePath = path.join(uploadsDir, fileId);
    const buffer = Buffer.from(await file.arrayBuffer());
    if (fs.existsSync(uploadsDir)) {
      fs.writeFileSync(filePath, buffer);
    }

    // Update database record (keep same ID, update name, size, version if provided)
    const updatedFile = await prisma.file.update({
      where: { id: fileId },
      data: {
        name: file.name,
        size: file.size,
        version: version || dbFile.version,
        fileData: buffer,
      },
    });

    return NextResponse.json({ success: true, file: updatedFile });
  } catch (error) {
    console.error("Update File error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
