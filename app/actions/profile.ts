"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { setProfileCookie } from "@/lib/session/cookies";
import { clearDemoSession } from "@/lib/session/demo";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const GateSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().min(8, "Enter a valid phone number"),
  emailOptIn: z.boolean(),
  smsOptIn: z.boolean(),
});

export type GateState = { error?: string };

export async function submitGate(
  _prev: GateState,
  formData: FormData,
): Promise<GateState> {
  const raw = {
    firstName: String(formData.get("firstName") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    emailOptIn: formData.get("emailOptIn") === "true",
    smsOptIn: formData.get("smsOptIn") === "true",
  };

  let parsed: z.infer<typeof GateSchema>;
  try {
    parsed = GateSchema.parse({
      firstName: raw.firstName,
      email: raw.email,
      phone: raw.phone,
      emailOptIn: raw.emailOptIn,
      smsOptIn: raw.smsOptIn,
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      const first = e.issues[0];
      return { error: first?.message ?? "Check your inputs" };
    }
    return { error: "Something went wrong" };
  }

  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("profiles")
    .insert({
      first_name: parsed.firstName,
      email: parsed.email,
      phone: parsed.phone,
      email_opt_in: parsed.emailOptIn,
      sms_opt_in: parsed.smsOptIn,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error(error);
    return { error: "Could not unlock right now — check Supabase config and tables." };
  }

  await clearDemoSession();
  await setProfileCookie(data.id);
  redirect("/quiz");
}
