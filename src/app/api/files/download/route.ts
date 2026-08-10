import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { getUserDirById } from "@/lib/userStorage";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("fileId");
    const licenseKey = searchParams.get("key");

    if (!fileId || !licenseKey) {
      return NextResponse.json({ error: "Missing fileId or license key parameter" }, { status: 400 });
    }

    // Verify file exists
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return NextResponse.json({ error: "Requested file not found" }, { status: 404 });
    }

    // Verify license status & app affiliation
    const license = await prisma.license.findFirst({
      where: {
        key: licenseKey,
        appId: file.appId,
      },
    });

    if (!license || license.status !== "ACTIVE") {
      return NextResponse.json({ error: "Unauthorized access. Invalid or inactive license key." }, { status: 403 });
    }

    // Check expiration
    if (license.expiresAt && new Date() > license.expiresAt) {
      return NextResponse.json({ error: "License key has expired. Cannot download file." }, { status: 403 });
    }

    // Register download analytics
    await prisma.file.update({
      where: { id: fileId },
      data: { downloads: file.downloads + 1 },
    });

    // In a real application, you would serve the file or redirect to private S3/Signed URL.
    // Here we read it directly from the database to support ephemeral hosting like Vercel.
    let fileBuffer: Buffer;
    if (file.fileData) {
      fileBuffer = Buffer.from(file.fileData);
    } else {
      const app = await prisma.application.findUnique({ where: { id: file.appId }});
      if (!app) return NextResponse.json({ error: "App not found" }, { status: 404 });

      const userDir = await getUserDirById(app.userId);
      if (!userDir) return NextResponse.json({ error: "User directory not found" }, { status: 500 });

      const filePath = path.join(userDir, "files", `${file.id}_${file.name}`);
      if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: "File binary missing from edge storage" }, { status: 404 });
      }

      fileBuffer = fs.readFileSync(filePath);
    }

    return new NextResponse(fileBuffer as any, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="${file.name}"`,
        "Content-Type": "application/octet-stream",
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("CDN Download Error:", error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
