import "server-only";
import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { AGE_CONSENT_COOKIE, isAgeConsentValue } from "@/lib/auth/age-consent";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type SyncProfileResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Metadata wins, then existing row, then age-consent cookie (first-time sync), else adult.
 */
async function resolveAlcoholPolicyFromSources(
  meta: Record<string, unknown>,
  existing: string | null | undefined,
): Promise<"adult" | "minor"> {
  const raw = meta.alcohol_policy;
  if (raw === "minor") return "minor";
  if (raw === "adult") return "adult";
  if (existing === "minor" || existing === "adult") return existing;
  const jar = await cookies();
  const c = jar.get(AGE_CONSENT_COOKIE)?.value;
  if (isAgeConsentValue(c) && c === "minor") return "minor";
  return "adult";
}

/**
 * Upserts `profiles` from a Supabase Auth user (JWT-validated user object).
 */
export async function upsertProfileFromAuthUser(user: User): Promise<SyncProfileResult> {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const admin = getSupabaseAdmin();

  const { data: existing } = await admin
    .from("profiles")
    .select("alcohol_policy")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  const alcohol_policy = await resolveAlcoholPolicyFromSources(meta, existing?.alcohol_policy);

  const payload = {
    auth_user_id: user.id,
    first_name: String(meta.first_name ?? "Friend").trim().slice(0, 120) || "Friend",
    last_name: String(meta.last_name ?? "").trim().slice(0, 120),
    email: user.email ?? "",
    phone: String(meta.phone ?? "").trim().slice(0, 40),
    email_opt_in: meta.email_opt_in !== false,
    sms_opt_in: meta.sms_opt_in !== false,
    alcohol_policy,
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
