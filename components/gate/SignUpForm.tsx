"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { syncProfileWithAccessToken } from "@/lib/profile/sync-profile-client";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

const labelCls =
  "block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--hs-muted)]";
const inputCls =
  "w-full rounded-xl border border-black/[0.09] bg-white px-3.5 py-2.5 text-[15px] leading-snug text-[var(--hs-ink)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] outline-none transition-[border-color,box-shadow] placeholder:text-black/35 focus:border-[var(--hs-accent)] focus:ring-2 focus:ring-[var(--hs-accent)]/18";

type SignUpFormProps = {
  showSwitchLink?: boolean;
  switchHref?: string;
  compact?: boolean;
};

export function SignUpForm({
  showSwitchLink = true,
  switchHref = "/login",
  compact = false,
}: SignUpFormProps = {}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const firstName = String(fd.get("firstName") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();

    try {
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }

      const supabase = createBrowserSupabaseClient();
      const { data, error: signErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            phone,
            email_opt_in: fd.has("emailOptIn"),
            sms_opt_in: fd.has("smsOptIn"),
          },
        },
      });

      if (signErr) {
        const msg = signErr.message.toLowerCase().includes("registered")
          ? "This email may already have an account. Try signing in instead."
          : signErr.message;
        setError(msg);
        return;
      }

      if (data.session?.access_token) {
        const synced = await syncProfileWithAccessToken(data.session.access_token);
        if (!synced.ok) {
          setError(synced.error);
          return;
        }
        router.replace("/quiz");
        router.refresh();
        return;
      }

      router.push(`/verify?email=${encodeURIComponent(email)}`);
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
        <label className={labelCls} htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          className={inputCls}
          placeholder="At least 6 characters"
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

      <fieldset
        className={`border border-[var(--hs-accent)]/[0.12] bg-gradient-to-b from-[var(--hs-accent)]/[0.05] to-transparent ${
          compact ? "space-y-2 rounded-xl p-2.5" : "space-y-2.5 rounded-2xl p-3.5"
        }`}
      >
        <legend className="sr-only">Marketing preferences</legend>
        <label className={`flex cursor-pointer items-start gap-2 text-xs leading-snug text-[var(--hs-ink)] ${compact ? "" : "sm:text-[13px]"}`}>
          <span className="mt-0.5 flex flex-col gap-1">
            <input
              type="checkbox"
              name="emailOptIn"
              value="true"
              defaultChecked
              className="h-4 w-4 rounded border-black/20 accent-[var(--hs-accent)]"
            />
          </span>
          <span>
            Email me Hidden Spirits news and pairings.
            {!compact ? <span className="text-[var(--hs-muted)]"> (Recommended)</span> : null}
          </span>
        </label>
        <label className={`flex cursor-pointer items-start gap-2 text-xs leading-snug text-[var(--hs-ink)] ${compact ? "" : "sm:text-[13px]"}`}>
          <span className="mt-0.5 flex flex-col gap-1">
            <input
              type="checkbox"
              name="smsOptIn"
              value="true"
              defaultChecked
              className="h-4 w-4 rounded border-black/20 accent-[var(--hs-accent)]"
            />
          </span>
          <span>
            Text me offers and drops.
            {!compact ? <span className="text-[var(--hs-muted)]"> (Recommended)</span> : null}
          </span>
        </label>
      </fieldset>

      <PrimaryButton
        type="submit"
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
