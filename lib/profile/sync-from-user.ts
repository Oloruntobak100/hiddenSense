import "server-only";
import type { User } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type SyncProfileResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Upserts `profiles` from a Supabase Auth user (JWT-validated user object).
 */
export async function upsertProfileFromAuthUser(user: User): Promise<SyncProfileResult> {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const admin = getSupabaseAdmin();

  const payload = {
    auth_user_id: user.id,
    first_name: String(meta.first_name ?? "Friend").trim().slice(0, 120) || "Friend",
    last_name: String(meta.last_name ?? "").trim().slice(0, 120),
    email: user.email ?? "",
    phone: String(meta.phone ?? "").trim().slice(0, 40),
    email_opt_in: meta.email_opt_in !== false,
    sms_opt_in: meta.sms_opt_in !== false,
  };

  const { error } = await admin.from("profiles").upsert(payload, {
    onConflict: "auth_user_id",
  });

  if (error) {
    console.error("[sync profile]", error);
    return { ok: false, error: "Could not save your profile." };
  }

  return { ok: true };
}
