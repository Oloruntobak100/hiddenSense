/** Remember last email used for OTP on this device (sessionStorage). */
export const HS_QUIZ_LAST_AUTH_EMAIL_KEY = "hs_quiz_last_auth_email";

export function readQuizLastAuthEmail(): string {
  if (typeof window === "undefined") return "";
  try {
    return sessionStorage.getItem(HS_QUIZ_LAST_AUTH_EMAIL_KEY) ?? "";
  } catch {
    return "";
  }
}

export function writeQuizLastAuthEmail(email: string): void {
  if (typeof window === "undefined") return;
  try {
    const t = email.trim();
    if (t) sessionStorage.setItem(HS_QUIZ_LAST_AUTH_EMAIL_KEY, t);
  } catch {
    /* private mode / blocked storage */
  }
}
