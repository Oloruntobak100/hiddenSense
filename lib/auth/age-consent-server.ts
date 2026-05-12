import "server-only";

import { cookies } from "next/headers";
import { AGE_CONSENT_COOKIE, isAgeConsentValue } from "@/lib/auth/age-consent";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * Policy for recommendations: logged-in users use persisted `profiles.alcohol_policy`;
 * anonymous / pre-profile requests fall back to the age-consent cookie, then adult.
 */
export async function getAgeAlcoholPolicy(): Promise<"adult" | "minor"> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.id) {
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from("profiles")
      .select("alcohol_policy")
      .eq("auth_user_id", user.id)
      .maybeSingle();
    if (data?.alcohol_policy === "minor" || data?.alcohol_policy === "adult") {
      return data.alcohol_policy;
    }
  }

  const jar = await cookies();
  const raw = jar.get(AGE_CONSENT_COOKIE)?.value;
  if (isAgeConsentValue(raw) && raw === "minor") return "minor";
  return "adult";
}
