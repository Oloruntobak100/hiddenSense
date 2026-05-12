import "server-only";

import { cookies } from "next/headers";
import { AGE_CONSENT_COOKIE, isAgeConsentValue } from "@/lib/auth/age-consent";

/** Missing cookie defaults to adult (legacy / deep links). */
export async function getAgeAlcoholPolicy(): Promise<"adult" | "minor"> {
  const jar = await cookies();
  const raw = jar.get(AGE_CONSENT_COOKIE)?.value;
  if (isAgeConsentValue(raw) && raw === "minor") return "minor";
  return "adult";
}
