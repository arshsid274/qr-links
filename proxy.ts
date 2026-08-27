import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, passwordHash } from "@/lib/auth";

// Next 16's replacement for middleware.ts. The redirect route (/r/[code])
// stays public; the dashboard and links API require the admin cookie.
const PUBLIC_PATTERNS = [/^\/r\//, /^\/login$/, /^\/api\/login$/];

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATTERNS.some((re) => re.test(pathname))) {
    return NextResponse.next();
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  // No password configured (e.g. local dev before setup) → leave open.
  if (!adminPassword) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(AUTH_COOKIE)?.value;
  if (cookie && cookie === (await passwordHash(adminPassword))) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/login";
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
