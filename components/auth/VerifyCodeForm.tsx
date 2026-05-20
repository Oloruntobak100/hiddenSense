"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { getSafeInternalNext } from "@/lib/auth/safe-next";
import { writeQuizLastAuthEmail } from "@/lib/auth/quiz-auth-cue";
import { syncProfileWithAccessToken } from "@/lib/profile/sync-profile-client";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

type VerifyCodeFormProps = {
  email: string;
  nextPath?: string;
  /** Prefer signup vs email OTP verification order. */
  flow?: "signup" | "signin";
};

export function VerifyCodeForm({ email, nextPath, flow = "signin" }: VerifyCodeFormProps) {
  const router = useRouter();
  const redirectTo = getSafeInternalNext(nextPath ?? null, "/dashboard");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const fd = new FormData(e.currentTarget);
    const raw = String(fd.get("code") ?? "");
    const token = raw.trim().replace(/\s+/g, "");

    if (!token) {
      setError("Enter the verification code from your email.");
      setPending(false);
      return;
    }

    try {
      const supabase = createBrowserSupabaseClient();
      const types =
        flow === "signup" ? (["signup", "email"] as const) : (["email", "signup"] as const);

      let otpResult = await supabase.auth.verifyOtp({ email, token, type: types[0] });
      if (otpResult.error) {
        otpResult = await supabase.auth.verifyOtp({ email, token, type: types[1] });
      }

      if (otpResult.error) {
        const msg = otpResult.error.message.toLowerCase().includes("expired")
          ? "That code has expired. Request a new one from sign in or sign up."
          : otpResult.error.message;
        setError(msg);
        return;
      }

      let accessToken = otpResult.data.session?.access_token;
      if (!accessToken) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        accessToken = session?.access_token;
      }

      if (!accessToken) {
        setError("Could not read your session after verification. Try signing in again.");
        return;
      }

      const synced = await syncProfileWithAccessToken(accessToken);
      if (!synced.ok) {
        setError(synced.error);
        return;
      }

      writeQuizLastAuthEmail(email);
      router.replace(redirectTo);
      router.refresh();
    } catch (err) {
      console.error("[HiddenSense verify]", err);
      setError("Verification failed. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-4">
      {error ? (
        <p
          className="rounded-xl border border-red-500/35 bg-red-500/[0.09] px-3.5 py-2.5 text-sm text-red-900"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="space-y-1.5">
        <label
          className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--hs-muted)]"
          htmlFor="code"
        >
          Verification code
        </label>
        <input
          id="code"
          name="code"
          required
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          className="w-full rounded-xl border border-black/[0.09] bg-white px-3.5 py-2.5 text-center font-mono text-lg tracking-[0.2em] text-[var(--hs-ink)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] outline-none placeholder:text-black/35 focus:border-[var(--hs-accent)] focus:ring-2 focus:ring-[var(--hs-accent)]/18"
        />
        <p className="text-xs text-[var(--hs-muted)]">Spaces are ignored. Paste the full code from your email.</p>
      </div>

      <PrimaryButton
        type="submit"
        loading={pending}
        disabled={pending}
        className="w-full justify-center rounded-xl bg-[var(--hs-accent)] py-3 text-[15px] font-semibold shadow-[0_12px_28px_-8px_rgba(37,99,235,0.55)]"
      >
        {pending ? "Verifying…" : "Verify & continue"}
      </PrimaryButton>

      <p className="text-center text-[13px] text-[var(--hs-muted)]">
        Wrong email?{" "}
        <Link href="/login" className="font-semibold text-[var(--hs-accent)] underline-offset-[3px] hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
