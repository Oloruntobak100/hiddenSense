export const AGE_CONSENT_COOKIE = "hs_age_consent";
export type AgeConsentValue = "adult" | "minor";

export function isAgeConsentValue(v: string | undefined): v is AgeConsentValue {
  return v === "adult" || v === "minor";
}
