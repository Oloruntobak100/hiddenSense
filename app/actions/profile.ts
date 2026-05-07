"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type EnsureProfileResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Upserts `profiles` from the current Supabase session + `user_metadata`
 * (populated at sign-up). Safe to call after verify OTP or password sign-in.
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

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const admin = getSupabaseAdmin();

  const payload = {
    auth_user_id: user.id,
    first_name: String(meta.first_name ?? "Friend").trim().slice(0, 120) || "Friend",
    email: user.email ?? "",
    phone: String(meta.phone ?? "").trim().slice(0, 40),
    email_opt_in: meta.email_opt_in !== false,
    sms_opt_in: meta.sms_opt_in !== false,
  };

  const { error } = await admin.from("profiles").upsert(payload, {
    onConflict: "auth_user_id",
  });

  if (error) {
    console.error(error);
    return { ok: false, error: "Could not save your profile." };
  }

  return { ok: true };
}
