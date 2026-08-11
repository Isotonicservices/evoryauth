import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token");

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    // Verify the token with your JWT verification logic
    // For now, just check if token exists
    // You should add proper JWT verification here
    return NextResponse.json({ authenticated: !!token }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}
