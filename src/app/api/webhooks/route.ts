import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, planName, amount, txId, status, method } = body;

    if (!userId || !planName || !amount) {
      return NextResponse.json({ error: "Invalid webhook checkout parameters" }, { status: 400 });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Record the payment
    const payment = await prisma.payment.create({
      data: {
        amount: parseFloat(amount),
        currency: "USD",
        method: method || "STRIPE",
        status: status || "COMPLETED",
        planName,
        transactionId: txId || `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        userId,
      },
    });

    // Update user plan level
    await prisma.user.update({
      where: { id: userId },
      data: { plan: planName.toUpperCase() },
    });

    return NextResponse.json({
      success: true,
      message: "Webhook processed, plan upgraded successfully",
      payment,
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook failure" }, { status: 500 });
  }
}
