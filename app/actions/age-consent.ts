"use server";

import { cookies } from "next/headers";
import { AGE_CONSENT_COOKIE, type AgeConsentValue } from "@/lib/auth/age-consent";
import { getAgeAlcoholPolicy } from "@/lib/auth/age-consent-server";

const MAX_AGE_SEC = 8 * 60 * 60; // 8 hours

/** Age band from cookie (or profile if already logged in) for `signInWithOtp` user_metadata. */
export async function resolveAgeForSignupMetadata(): Promise<"adult" | "minor"> {
  return getAgeAlcoholPolicy();
}

export async function setAgeConsentCookie(consent: AgeConsentValue): Promise<{ ok: true } | { ok: false; error: string }> {
  const jar = await cookies();
  jar.set(AGE_CONSENT_COOKIE, consent, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE_SEC,
    path: "/",
  });
  return { ok: true };
}
