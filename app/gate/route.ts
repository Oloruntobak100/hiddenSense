import { NextRequest, NextResponse } from "next/server";

/** Legacy URL: `/gate` used a different layout; keep redirect so bookmarks and old links still work. */
export function GET(request: NextRequest) {
  const u = new URL(request.url);
  u.pathname = "/login";
  return NextResponse.redirect(u, 308);
}
