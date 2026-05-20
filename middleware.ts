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

/** Supabase may refresh tokens on `from`; redirects must carry those Set-Cookie headers. */
function copySupabaseCookiesAndCacheHeaders(from: NextResponse, to: NextResponse) {
  for (const c of from.cookies.getAll()) {
    const { name, value, ...opts } = c;
    const cleaned = Object.fromEntries(Object.entries(opts).filter(([, v]) => v !== undefined));
    to.cookies.set(name, value, cleaned);
  }
  for (const key of ["cache-control", "pragma", "expires"] as const) {
    const v = from.headers.get(key);
    if (v) to.headers.set(key, v);
  }
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
      setAll(cookiesToSet, responseHeaders) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
        if (responseHeaders) {
          for (const [key, value] of Object.entries(responseHeaders)) {
            response.headers.set(key, String(value));
          }
        }
      },
    },
  });

  // Hydrate from cookies first; then validate JWT (Supabase SSR pattern).
  await supabase.auth.getSession();
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

  if (needsAuth && !user && !allowTesterCookieBypass(request)) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    const redirect = NextResponse.redirect(login);
    copySupabaseCookiesAndCacheHeaders(response, redirect);
    return redirect;
  }

  if (pathname.startsWith("/admin")) {
    if (!user) {
      const login = new URL("/login", request.url);
      const returnTo = `${pathname}${request.nextUrl.search}`;
      login.searchParams.set("next", returnTo);
      const redirect = NextResponse.redirect(login);
      copySupabaseCookiesAndCacheHeaders(response, redirect);
      return redirect;
    }
    if (!isAdminEmail(user.email)) {
      const redirect = NextResponse.redirect(new URL("/dashboard", request.url));
      copySupabaseCookiesAndCacheHeaders(response, redirect);
      return redirect;
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
