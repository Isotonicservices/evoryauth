import React from "react";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("secure_auth_token")?.value;

  if (!token) {
    redirect("/login");
  }

  const userPayload = verifyToken(token);
  if (!userPayload) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: userPayload.userId }
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#020106] text-slate-100 flex relative">
      {children}
    </div>
  );
}
