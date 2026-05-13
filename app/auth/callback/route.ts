import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSafeInternalNext } from "@/lib/auth/safe-next";
import { upsertProfileFromAuthUser } from "@/lib/profile/sync-from-user";
import { supabaseAuthCookieOptions } from "@/lib/supabase/auth-cookie-options";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextRaw = url.searchParams.get("next");
  const nextPath = getSafeInternalNext(nextRaw, "/dashboard");
  const siteOrigin = url.origin;

  if (!code) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent("missing_code")}`, siteOrigin),
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anon) {
    return NextResponse.redirect(new URL("/login?error=config", siteOrigin));
  }

  const redirectOnSuccess = new URL(nextPath, siteOrigin);
  const response = NextResponse.redirect(redirectOnSuccess);

  const supabase = createServerClient(supabaseUrl, anon, {
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

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent("session_exchange")}`, siteOrigin),
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    await upsertProfileFromAuthUser(user);
  }

  return response;
}
