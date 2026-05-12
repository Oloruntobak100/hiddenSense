"use server";

import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const emailSchema = z.string().trim().toLowerCase().email().max(320);

export type RegisteredEmailResult =
  | { ok: true; registered: boolean }
  | { ok: false; error: string };

/**
 * Whether an email already belongs to someone (profile row or Auth user).
 * Used before sending magic-link OTP so we don't email non-accounts on Sign in
 * or duplicate signups on Sign up.
 */
export async function checkRegisteredEmail(rawEmail: string): Promise<RegisteredEmailResult> {
  const parsed = emailSchema.safeParse(rawEmail);
  if (!parsed.success) {
    return { ok: false, error: "Enter a valid email address." };
  }
  const email = parsed.data;

  const admin = getSupabaseAdmin();
  const { data, error } = await admin.rpc("registered_email_exists", { lookup_email: email });

  if (error) {
    console.error("[checkRegisteredEmail]", error);
    return { ok: false, error: "Could not verify that email. Try again." };
  }

  return { ok: true, registered: Boolean(data) };
}
