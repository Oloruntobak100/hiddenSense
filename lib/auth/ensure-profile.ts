import "server-only";

import { getCurrentProfileId } from "@/lib/auth/current-profile";
import { getServerAuthUser } from "@/lib/auth/server-user";
import { upsertProfileFromAuthUser } from "@/lib/profile/sync-from-user";

/** Resolves profile id, syncing from Supabase Auth when the user exists but the row is missing. */
export async function ensureProfileId(): Promise<string | null> {
  const existing = await getCurrentProfileId();
  if (existing) return existing;

  const user = await getServerAuthUser();
  if (!user) return null;

  await upsertProfileFromAuthUser(user);
  return getCurrentProfileId();
}
