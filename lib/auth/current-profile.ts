import "server-only";
import { getServerAuthUser } from "@/lib/auth/server-user";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getProfileIdFromCookies } from "@/lib/session/cookies";
import { isDemoSession } from "@/lib/session/demo";
import { isOfflineDemoEnabled } from "@/lib/features/tester-access";

/** Authenticated Supabase user id, or null. */
export async function getAuthUserId(): Promise<string | null> {
  const user = await getServerAuthUser();
  return user?.id ?? null;
}

/**
 * Resolves `profiles.id` for the current request: prefers linked Supabase Auth user,
 * falls back to dev tester cookie path when enabled.
 */
export async function getCurrentProfileId(): Promise<string | null> {
  const user = await getServerAuthUser();

  if (user) {
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from("profiles")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle();
    if (data?.id) return data.id;
    return null;
  }

  const stub = await getProfileIdFromCookies();
  if (!stub) return null;

  const demo = await isDemoSession();
  if (demo && (isOfflineDemoEnabled() || process.env.NODE_ENV === "development")) {
    return stub;
  }

  if (
    process.env.NODE_ENV === "development" ||
    process.env.ENABLE_QUICK_LOGIN === "true"
  ) {
    return stub;
  }

  return null;
}
