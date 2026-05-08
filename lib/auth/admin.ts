import "server-only";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const ADMIN_EMAIL = "kaytoba49@gmail.com";

export function isAdminEmail(email?: string | null) {
  if (!email) return false;
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

export async function requireAdminUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    redirect("/");
  }

  return user;
}
