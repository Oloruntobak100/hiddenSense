import type { CookieOptionsWithName } from "@supabase/ssr";

const isProd = process.env.NODE_ENV === "production";

/**
 * Shared across browser, server, middleware, and auth callback so Supabase
 * auth cookies serialize the same way (avoids early “logged out” / split client).
 *
 * - `path: "/"` — sent on /quiz, /dashboard, server actions, etc.
 * - `maxAge` — keep auth cookies across browser restarts (long-lived jar). There is no app-imposed idle timeout;
 *   Supabase refreshes access tokens while the tab is used. Session ends on explicit POST `/logout` or when the user clears site data.
 * - `sameSite: "lax"` — magic-link return still lands with cookies on first navigation.
 */
export const supabaseAuthCookieOptions: CookieOptionsWithName = {
  path: "/",
  sameSite: "lax",
  secure: isProd,
  maxAge: 60 * 60 * 24 * 365,
};
