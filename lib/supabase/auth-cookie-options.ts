import type { CookieOptionsWithName } from "@supabase/ssr";

const isProd = process.env.NODE_ENV === "production";

/**
 * Shared across browser, server, middleware, and auth callback so Supabase
 * auth cookies serialize the same way (avoids early “logged out” / split client).
 *
 * - `path: "/"` — sent on /quiz, /dashboard, server actions, etc.
 * - `maxAge` — keep cookie jars across browser restarts until Supabase revokes the refresh token.
 * - `sameSite: "lax"` — magic-link return still lands with cookies on first navigation.
 */
export const supabaseAuthCookieOptions: CookieOptionsWithName = {
  path: "/",
  sameSite: "lax",
  secure: isProd,
  maxAge: 60 * 60 * 24 * 365,
};
