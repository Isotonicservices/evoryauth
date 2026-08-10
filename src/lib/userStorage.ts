import fs from "fs";
import path from "path";
import { prisma } from "./prisma";

/**
 * Sanitize email for use as a directory name.
 * Replaces any character that isn't alphanumeric, @, or . with an underscore.
 */
function sanitizeEmail(email: string): string {
  return email.replace(/[^a-zA-Z0-9@.]/g, "_");
}

/**
 * Ensures a user directory exists at: <project>/users/<sanitized_email>/
 * Creates info.json with user details and a files/ subfolder.
 * Returns the absolute path to the user directory.
 */
export function ensureUserDirectory(user: {
  email: string;
  username: string;
  role: string;
  plan: string;
  id: string;
  password?: string;
}): string {
  const sanitized = sanitizeEmail(user.email);
  const userDir = path.join(process.cwd(), "users", sanitized);

  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }

  // Write/update info.json
  const infoPath = path.join(userDir, "info.json");
  const info: any = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    plan: user.plan,
    updatedAt: new Date().toISOString(),
  };
  if (user.password) {
    info.password = user.password;
  }
  fs.writeFileSync(infoPath, JSON.stringify(info, null, 2), "utf8");

  // Ensure files subfolder
  const filesDir = path.join(userDir, "files");
  if (!fs.existsSync(filesDir)) {
    fs.mkdirSync(filesDir, { recursive: true });
  }

  return userDir;
}

/**
 * Save a file to the user's files/ directory.
 * File is saved as <fileId>_<fileName>
 */
export function saveFileToUserDir(
  userDir: string,
  fileId: string,
  fileName: string,
  content: Buffer
): void {
  const filesDir = path.join(userDir, "files");
  if (!fs.existsSync(filesDir)) {
    fs.mkdirSync(filesDir, { recursive: true });
  }
  const filePath = path.join(filesDir, `${fileId}_${fileName}`);
  fs.writeFileSync(filePath, content);
}

/**
 * Delete a file from the user's files/ directory.
 */
export function deleteFileFromUserDir(
  userDir: string,
  fileId: string,
  fileName: string
): void {
  const filePath = path.join(userDir, "files", `${fileId}_${fileName}`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

/**
 * Update user's apps.json with their current applications list.
 */
export async function updateUserAppsOnDisk(userId: string): Promise<void> {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const userDir = ensureUserDirectory(user);

    const apps = await prisma.application.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        version: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const appsPath = path.join(userDir, "apps.json");
    fs.writeFileSync(appsPath, JSON.stringify(apps, null, 2), "utf8");
  } catch (e) {
    console.error("Failed to update user apps on disk:", e);
  }
}

/**
 * Get user directory path by userId (looks up email from DB).
 * Returns null if user not found.
 */
export async function getUserDirById(userId: string): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;
    return ensureUserDirectory(user);
  } catch {
    return null;
  }
}
