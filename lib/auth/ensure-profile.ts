import "server-only";

import { getCurrentProfileId } from "@/lib/auth/current-profile";
import { upsertProfileFromAuthUser } from "@/lib/profile/sync-from-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/** Resolves profile id, syncing from Supabase Auth when the user exists but the row is missing. */
export async function ensureProfileId(): Promise<string | null> {
  const existing = await getCurrentProfileId();
  if (existing) return existing;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  await upsertProfileFromAuthUser(user);
  return getCurrentProfileId();
}
