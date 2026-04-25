import { NextRequest, NextResponse } from "next/server";
import { verifyToken, buildCookieValue, adminCookieOptions, COOKIE_NAME } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { token } = await req.json().catch(() => ({}));
  if (typeof token !== "string" || !token) {
    return NextResponse.json({ ok: false, error: "Missing token" }, { status: 400 });
  }
  if (!verifyToken(token)) {
    // Constant 1.5s delay to slow down brute force
    await new Promise((r) => setTimeout(r, 1500));
    return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 401 });
  }
  const cookieValue = buildCookieValue();
  if (!cookieValue) {
    return NextResponse.json({ ok: false, error: "Server admin token not configured" }, { status: 500 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ ...adminCookieOptions(), value: cookieValue });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ ...adminCookieOptions(), value: "", maxAge: 0 });
  return res;
}
