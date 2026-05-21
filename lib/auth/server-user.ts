import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

/**
 * Resolves the authenticated Supabase user for Server Components.
 * Calls getSession() before getUser() so cookie hydration matches middleware refresh.
 */
export async function getServerAuthUser(): Promise<User | null> {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.getSession();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}
