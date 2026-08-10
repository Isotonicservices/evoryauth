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

export async function GET(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const appId = searchParams.get("appId");

    // Fetch list of user applications for selecting dropdown
    const apps = await prisma.application.findMany({
      where: { userId: user.userId },
      select: { id: true, name: true },
    });

    const activeAppId = appId || (apps.length > 0 ? apps[0].id : null);

    if (!activeAppId) {
      return NextResponse.json({
        success: true,
        apps: [],
        stats: {
          appCount: 0,
          licensesCount: 0,
          activeLicensesCount: 0,
          downloadsCount: 0,
          recentLogs: [],
          chartData: [],
        },
      });
    }

    // Pull aggregate counts
    const appCount = apps.length;
    
    const licensesCount = await prisma.license.count({
      where: { appId: activeAppId },
    });

    const activeLicensesCount = await prisma.license.count({
      where: { appId: activeAppId, status: "ACTIVE" },
    });

    const files = await prisma.file.findMany({
      where: { appId: activeAppId },
      select: { downloads: true },
    });
    const downloadsCount = files.reduce((acc: number, f: { downloads: number }) => acc + f.downloads, 0);

    // Retrieve last 10 logs for application
    const recentLogs = await prisma.log.findMany({
      where: { appId: activeAppId },
      take: 10,
      orderBy: { createdAt: "desc" },
    });

    // Dummy mock data for Charts
    const chartData = [
      { name: "Mon", requests: 120, licenses: 5 },
      { name: "Tue", requests: 190, licenses: 12 },
      { name: "Wed", requests: 300, licenses: 19 },
      { name: "Thu", requests: 250, licenses: 22 },
      { name: "Fri", requests: 400, licenses: 30 },
      { name: "Sat", requests: 480, licenses: 42 },
      { name: "Sun", requests: 520, licenses: 55 },
    ];

    return NextResponse.json({
      success: true,
      apps,
      activeAppId,
      stats: {
        appCount,
        licensesCount,
        activeLicensesCount,
        downloadsCount,
        recentLogs,
        chartData,
      },
    });
  } catch (error) {
    console.error("Dashboard Stats Route Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
