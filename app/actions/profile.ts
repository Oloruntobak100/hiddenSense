"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { upsertProfileFromAuthUser } from "@/lib/profile/sync-from-user";

export type EnsureProfileResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Upserts `profiles` from the current Supabase session (requires cookies).
 * Prefer `syncProfileWithAccessToken` from the client after OTP/sign-in when cookies may lag.
 */
export async function ensureProfileAfterAuth(): Promise<EnsureProfileResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return { ok: false, error: "Not signed in." };
  }

  return upsertProfileFromAuthUser(user);
}
