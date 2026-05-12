"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { clearProfileCookie, setProfileCookie } from "@/lib/session/cookies";
import { clearDemoSession, setDemoSessionFlag } from "@/lib/session/demo";
import { isOfflineDemoEnabled, isTesterUiEnabled } from "@/lib/features/tester-access";

export type TesterLoginState = { error?: string };

export async function testerQuickEnter(
  _prev: TesterLoginState,
  _formData: FormData,
): Promise<TesterLoginState> {
  if (!isTesterUiEnabled()) {
    return { error: "Tester login is not enabled for this environment." };
  }

  await clearDemoSession();
  await clearProfileCookie();

  try {
    const sb = getSupabaseAdmin();
    const stamp = Date.now();
    const { data, error } = await sb
      .from("profiles")
      .insert({
        first_name: "Tester",
        email: `tester+${stamp}@hiddensense.local`,
        phone: "+10000000099",
        email_opt_in: true,
        sms_opt_in: false,
        alcohol_policy: "adult",
      })
      .select("id")
      .single();

    if (error || !data) {
      throw error ?? new Error("insert failed");
    }

    await setProfileCookie(data.id);
  } catch (e) {
    if (!isOfflineDemoEnabled()) {
      console.error(e);
      return {
        error:
          "Could not create a Supabase profile. Add valid `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` and run the migration, or set ENABLE_OFFLINE_DEMO=true for UI-only mode (not for production).",
      };
    }

    await setProfileCookie(randomUUID());
    await setDemoSessionFlag();
  }

  redirect("/quiz");
}
