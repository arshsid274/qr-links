import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, passwordHash } from "@/lib/auth";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || password !== adminPassword) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const res = new NextResponse(null, { status: 204 });
  res.cookies.set(AUTH_COOKIE, await passwordHash(adminPassword), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: THIRTY_DAYS,
    path: "/",
  });
  return res;
}
