import { prisma } from "./prisma";

// Validates if the user is authorized to manage the requested resource (App/License/File)
// Users with ADMIN_MINI role can manage applications owned by an ADMIN
export async function verifyAppOwnership(appId: string, userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return false;

  const app = await prisma.application.findUnique({
    where: { id: appId },
    include: { user: true }
  });

  if (!app) return false;

  // If the user owns the app directly
  if (app.userId === userId) return true;

  // If the user is an ADMIN_MINI, allow them to manage if the app owner is an ADMIN
  if (user.role === "ADMIN_MINI" && app.user.role === "ADMIN") {
    return true;
  }

  return false;
}

// Fetch all applications the user has access to
export async function getAccessibleApps(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return [];

  if (user.role === "ADMIN_MINI") {
    // Return user's own apps + apps owned by any ADMIN
    return prisma.application.findMany({
      where: {
        OR: [
          { userId: userId },
          { user: { role: "ADMIN" } }
        ]
      },
      orderBy: { createdAt: "desc" }
    });
  }

  // Regular user or ADMIN only sees their own apps
  return prisma.application.findMany({
    where: { userId: userId },
    orderBy: { createdAt: "desc" }
  });
}

// Check if user has an active subscription (or is ADMIN)
export async function checkSubscription(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return false;

  // Admins always bypass subscription check
  if (user.role === "ADMIN") return true;

  // ADMIN_MINI helpers also bypass
  if (user.role === "ADMIN_MINI") return true;

  // If user has a paid plan set by admin (anything other than FREE), allow access
  if (user.plan && user.plan !== "FREE") {
    // If there's an expiry date, check it hasn't passed
    if (user.subscriptionEnd) {
      return user.subscriptionEnd > new Date();
    }
    // Plan is set but no expiry = treat as active (admin-assigned lifetime)
    return true;
  }

  // Fallback: check subscriptionEnd date for FREE users who paid
  if (user.subscriptionEnd && user.subscriptionEnd > new Date()) {
    return true;
  }

  return false;
}
