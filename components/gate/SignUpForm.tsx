"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { getBrowserAuthBaseUrl } from "@/lib/env";
import { getSafeInternalNext } from "@/lib/auth/safe-next";
import { resolveAgeForSignupMetadata } from "@/app/actions/age-consent";
import { writeQuizLastAuthEmail } from "@/lib/auth/quiz-auth-cue";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

const labelCls =
  "block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--hs-muted)]";
const inputCls =
  "w-full rounded-xl border border-black/[0.09] bg-white px-3.5 py-2.5 text-[15px] leading-snug text-[var(--hs-ink)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] outline-none transition-[border-color,box-shadow] placeholder:text-black/35 focus:border-[var(--hs-accent)] focus:ring-2 focus:ring-[var(--hs-accent)]/18";

type SignUpFormProps = {
  showSwitchLink?: boolean;
  switchHref?: string;
  compact?: boolean;
  /** Post-confirmation redirect (allowlisted). Defaults from `?next=` or `/dashboard`. */
  authNextPath?: string;
};

export function SignUpForm({
  showSwitchLink = true,
  switchHref = "/login",
  compact = false,
  authNextPath: authNextPathProp,
}: SignUpFormProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextFromUrl = searchParams.get("next");
  const authNextPath = getSafeInternalNext(
    authNextPathProp ?? nextFromUrl ?? null,
    "/dashboard",
  );

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const maxDob = useMemo(() => new Date().toISOString().slice(0, 10), []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const firstName = String(fd.get("firstName") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();
    const dateOfBirth = String(fd.get("dateOfBirth") ?? "").trim();

    try {
      const alcohol_policy = await resolveAgeForSignupMetadata();
      const supabase = createBrowserSupabaseClient();
      const base = getBrowserAuthBaseUrl();
      const redirectTo = `${base}/auth/callback?next=${encodeURIComponent(authNextPath)}`;

      const { error: signErr } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: redirectTo,
          data: {
            first_name: firstName,
            last_name: "",
            phone,
            alcohol_policy,
            ...(dateOfBirth ? { date_of_birth: dateOfBirth } : {}),
            // No marketing toggles in UI; keep explicit defaults for profile sync.
            email_opt_in: false,
            sms_opt_in: false,
          },
        },
      });

      if (signErr) {
        const msg = signErr.message.toLowerCase().includes("rate")
          ? "Too many attempts. Wait a moment and try again."
          : signErr.message;
        setError(msg);
        return;
      }

      writeQuizLastAuthEmail(email);

      router.push(`/verify?email=${encodeURIComponent(email)}`);
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={`relative flex w-full flex-col ${compact ? "gap-3" : "gap-4"}`}>
      {error ? (
        <p
          className={`border border-red-500/35 bg-red-500/[0.09] text-red-900 ${
            compact ? "rounded-lg px-3 py-2 text-xs" : "rounded-xl px-3.5 py-2.5 text-sm"
          }`}
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className={compact ? "space-y-1" : "space-y-1.5"}>
        <label className={labelCls} htmlFor="firstName">
          First name
        </label>
        <input
          id="firstName"
          name="firstName"
          autoComplete="given-name"
          required
          className={inputCls}
          placeholder="Alex"
        />
      </div>

      <div className={compact ? "space-y-1" : "space-y-1.5"}>
        <label className={labelCls} htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={inputCls}
          placeholder="you@example.com"
        />
      </div>

      <div className={compact ? "space-y-1" : "space-y-1.5"}>
        <label className={labelCls} htmlFor="phone">
          Phone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          className={inputCls}
          placeholder="+1 555 123 4567"
        />
      </div>

      <div className={compact ? "space-y-1" : "space-y-1.5"}>
        <label className={labelCls} htmlFor="dateOfBirth">
          Date of birth <span className="font-normal normal-case text-[var(--hs-muted)]">(optional)</span>
        </label>
        <input
          id="dateOfBirth"
          name="dateOfBirth"
          type="date"
          className={inputCls}
          max={maxDob}
        />
      </div>

      <PrimaryButton
        type="submit"
        loading={pending}
        disabled={pending}
        className={`mt-1 w-full justify-center rounded-xl bg-[var(--hs-accent)] font-semibold shadow-[0_12px_28px_-8px_rgba(37,99,235,0.55)] transition-[transform,box-shadow] motion-safe:active:scale-[0.99] ${
          compact ? "py-2.5 text-sm" : "py-3 text-[15px]"
        }`}
      >
        {pending ? "Please wait…" : "Create Account"}
      </PrimaryButton>

      {showSwitchLink ? (
        <p className="text-center text-[13px] text-[var(--hs-muted)]">
          Already have an account?{" "}
          <Link
            href={switchHref}
            className="font-semibold text-[var(--hs-accent)] underline-offset-[3px] hover:underline"
          >
            Sign in
          </Link>
        </p>
      ) : null}
    </form>
  );
}
