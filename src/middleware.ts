import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  sub: string;
  role: string;
  exp: number;
}

const PUBLIC_PATHS = ["/login", "/signup"];

const ROLE_HOME: Record<string, string> = {
  admin: "/admin/dashboard",
  ranger: "/ranger/dashboard",
  user: "/visitor/dashboard",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = request.cookies.get("warms_token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const payload = jwtDecode<JwtPayload>(token);
    if (payload.exp * 1000 < Date.now()) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    const role = payload.role;

    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(
        new URL(ROLE_HOME[role] ?? "/login", request.url)
      );
    }
    if (pathname.startsWith("/ranger") && role !== "ranger" && role !== "admin") {
      return NextResponse.redirect(
        new URL(ROLE_HOME[role] ?? "/login", request.url)
      );
    }
    if (pathname.startsWith("/visitor") && role !== "user") {
      return NextResponse.redirect(
        new URL(ROLE_HOME[role] ?? "/login", request.url)
      );
    }
  } catch {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)",
  ],
};
