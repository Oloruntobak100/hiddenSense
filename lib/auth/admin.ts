import "server-only";
import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth/admin-allowlist";

export { isAdminEmail };

export async function requireAdminUser(): Promise<User> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const sessionEmail = session?.user?.email;
  if (sessionEmail && isAdminEmail(sessionEmail) && session?.user) {
    return session.user;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user && isAdminEmail(user.email)) {
    return user;
  }

  redirect("/dashboard");
}
