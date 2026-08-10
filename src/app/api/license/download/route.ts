import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { key, hwid, fileId, secret, name, ownerid } = body;

    if (!key || !fileId || !secret) {
      return new NextResponse("Missing parameters", { status: 400 });
    }

    // 1. Verify app
    const app = await prisma.application.findFirst({
      where: {
        secret,
        name,
        user: { id: ownerid }
      }
    });

    if (!app || app.status !== "ACTIVE") {
      return new NextResponse("Unauthorized application", { status: 403 });
    }

    // 2. HWID Blacklist check
    if (hwid) {
      const blacklisted = await prisma.hwidBlacklist.findUnique({ where: { hwid } });
      if (blacklisted) {
        return new NextResponse("Banned device hardware", { status: 403 });
      }
    }

    // 3. Verify license status
    const license = await prisma.license.findFirst({
      where: { key, appId: app.id }
    });

    if (!license || license.status !== "ACTIVE") {
      return new NextResponse("Invalid or banned license key", { status: 403 });
    }

    // 4. Verify file exists in registry and belongs to app
    const file = await prisma.file.findFirst({
      where: { id: fileId, appId: app.id }
    });

    if (!file) {
      return new NextResponse("Requested file not found in registry", { status: 404 });
    }

    // 5. Read physical file binary bytes from DB (or fallback to disk)
    let fileBuffer: Buffer;
    
    if (file.fileData) {
      fileBuffer = Buffer.from(file.fileData);
    } else {
      const uploadsDir = path.join(process.cwd(), "uploads");
      const filePath = path.join(uploadsDir, file.id);

      if (!fs.existsSync(filePath)) {
        console.error(`Binary file not found on disk or DB: ${file.id}`);
        return new NextResponse("Binary storage file not found", { status: 404 });
      }
      fileBuffer = fs.readFileSync(filePath);
    }

    // Update download analytics
    await prisma.file.update({
      where: { id: file.id },
      data: { downloads: file.downloads + 1 }
    });

    // Log action
    await prisma.log.create({
      data: {
        action: "VALIDATE",
        message: `File ${file.name} downloaded successfully in binary stream`,
        appId: app.id,
        hwid
      }
    });

    // Return the raw binary stream directly!
    return new NextResponse(fileBuffer as any, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${file.name}"`,
        "Content-Length": fileBuffer.length.toString()
      }
    });
  } catch (error) {
    console.error("License download error:", error);
    return new NextResponse("Server download error", { status: 500 });
  }
}
