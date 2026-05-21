import "server-only";

import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  DEMO_MODE_COOKIE,
  DEMO_RESULT_COOKIE,
  PROFILE_COOKIE,
} from "@/lib/session/constants";

/** Clears Supabase auth and app session cookies. Only call from explicit sign-out (POST), never from GET/prefetch. */
export async function performSignOut(): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();

  const jar = await cookies();
  jar.delete(PROFILE_COOKIE);
  jar.delete(DEMO_MODE_COOKIE);
  jar.delete(DEMO_RESULT_COOKIE);
}
