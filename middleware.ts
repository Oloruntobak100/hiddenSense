import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminEmail } from "@/lib/auth/admin-allowlist";
import { PROFILE_COOKIE } from "@/lib/session/constants";
import { isUuid } from "@/lib/session/uuid";
import { supabaseAuthCookieOptions } from "@/lib/supabase/auth-cookie-options";

function allowTesterCookieBypass(request: NextRequest): boolean {
  if (
    process.env.NODE_ENV !== "development" &&
    process.env.ENABLE_QUICK_LOGIN !== "true"
  ) {
    return false;
  }
  const raw = request.cookies.get(PROFILE_COOKIE)?.value;
  return !!(raw && isUuid(raw));
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    return response;
  }

  const supabase = createServerClient(url, anon, {
    cookieOptions: supabaseAuthCookieOptions,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublicQuiz = pathname === "/quiz" || pathname.startsWith("/quiz/");
  const needsAuth =
    !isPublicQuiz &&
    (pathname === "/intro" ||
      pathname === "/dashboard" ||
      pathname.startsWith("/dashboard/") ||
      pathname === "/profile" ||
      pathname.startsWith("/feedback/"));

  if (
    needsAuth &&
    !user &&
    !allowTesterCookieBypass(request)
  ) {
    const gate = new URL("/gate", request.url);
    gate.searchParams.set("next", pathname);
    return NextResponse.redirect(gate);
  }

  if (pathname.startsWith("/admin")) {
    if (!user || !isAdminEmail(user.email)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Refresh auth cookies on almost every navigation (not only /quiz).
     * Previously, sessions went stale when users stayed on routes outside
     * the old list (e.g. home) before returning to quiz.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
