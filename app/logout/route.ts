import { NextResponse } from "next/server";
import { performSignOut } from "@/lib/auth/sign-out";

/**
 * GET must not sign out: Next.js prefetches <Link href="/logout"> in the viewport,
 * which was destroying sessions when users opened the account menu or landed on login.
 */
export async function GET() {
  return new NextResponse(null, { status: 405 });
}

export async function POST(request: Request) {
  await performSignOut();
  return NextResponse.redirect(new URL("/", request.url));
}
