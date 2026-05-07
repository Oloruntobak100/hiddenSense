import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PROFILE_COOKIE } from "@/lib/session/constants";
import { isUuid } from "@/lib/session/uuid";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const needsProfile =
    pathname === "/quiz" ||
    pathname.startsWith("/result/") ||
    pathname.startsWith("/feedback/");

  if (!needsProfile) {
    return NextResponse.next();
  }

  const raw = request.cookies.get(PROFILE_COOKIE)?.value;
  if (!raw || !isUuid(raw)) {
    const gate = new URL("/gate", request.url);
    gate.searchParams.set("next", pathname);
    return NextResponse.redirect(gate);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/quiz", "/result/:path*", "/feedback/:path*"],
};
