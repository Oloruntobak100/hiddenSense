"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { getBrowserAuthBaseUrl } from "@/lib/env";
import { getSafeInternalNext } from "@/lib/auth/safe-next";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

type SignInFormProps = {
  showSwitchLink?: boolean;
  switchHref?: string;
  compact?: boolean;
};

export function SignInForm({
  showSwitchLink = true,
  switchHref = "/login?mode=signup",
  compact = false,
}: SignInFormProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = getSafeInternalNext(searchParams.get("next"), "/intro");

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();

    try {
      const supabase = createBrowserSupabaseClient();
      const base = getBrowserAuthBaseUrl();
      const redirectTo = `${base}/auth/callback?next=${encodeURIComponent(nextPath)}`;

      const { error: signErr } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: redirectTo,
        },
      });

      if (signErr) {
        setError(signErr.message);
        return;
      }

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
        <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--hs-muted)]" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-xl border border-black/[0.09] bg-white px-3.5 py-2.5 text-[15px] leading-snug text-[var(--hs-ink)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] outline-none placeholder:text-black/35 focus:border-[var(--hs-accent)] focus:ring-2 focus:ring-[var(--hs-accent)]/18"
          placeholder="you@example.com"
        />
      </div>

      <PrimaryButton
        type="submit"
        disabled={pending}
        className={`w-full justify-center rounded-xl bg-[var(--hs-accent)] font-semibold shadow-[0_12px_28px_-8px_rgba(37,99,235,0.55)] ${
          compact ? "py-2.5 text-sm" : "py-3 text-[15px]"
        }`}
      >
        {pending ? "Sending…" : "Email me the link"}
      </PrimaryButton>

      {showSwitchLink ? (
        <p className="text-center text-[13px] text-[var(--hs-muted)]">
          New here?{" "}
          <Link href={switchHref} className="font-semibold text-[var(--hs-accent)] underline-offset-[3px] hover:underline">
            Create an account
          </Link>
        </p>
      ) : null}

      <p className="text-center text-[12px] text-[var(--hs-muted)]">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="font-medium text-[var(--hs-accent)] underline-offset-2 hover:underline"
        >
          Back to home
        </button>
      </p>
    </form>
  );
}
