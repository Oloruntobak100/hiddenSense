"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { syncProfileWithAccessToken } from "@/lib/profile/sync-profile-client";
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
  const nextPath = searchParams.get("next") ?? "/intro";

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");

    try {
      const supabase = createBrowserSupabaseClient();
      const { error: signErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signErr) {
        setError(signErr.message);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) {
        setError("Could not establish session. Try again.");
        return;
      }

      const synced = await syncProfileWithAccessToken(accessToken);
      if (!synced.ok) {
        setError(synced.error);
        return;
      }

      const safeNext = nextPath.startsWith("/") ? nextPath : "/intro";
      router.replace(safeNext);
      router.refresh();
    } catch {
      setError("Sign-in failed. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={`flex w-full flex-col ${compact ? "gap-3" : "gap-5"}`}>
      {error ? (
        <p
          className={`border border-red-500/30 bg-red-500/10 text-red-800 ${
            compact ? "rounded-xl px-3 py-2 text-xs" : "rounded-2xl px-4 py-3 text-sm"
          }`}
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className={compact ? "space-y-1.5" : "space-y-2"}>
        <label className={`${compact ? "text-xs" : "text-sm"} font-medium text-[var(--hs-muted)]`} htmlFor="signin-email">
          Email
        </label>
        <input
          id="signin-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={`w-full border border-black/10 bg-white text-[var(--hs-ink)] shadow-inner outline-none focus:border-[var(--hs-accent)] ${
            compact ? "rounded-xl px-3 py-2.5 text-sm" : "rounded-2xl px-4 py-3"
          }`}
        />
      </div>

      <div className={compact ? "space-y-1.5" : "space-y-2"}>
        <label className={`${compact ? "text-xs" : "text-sm"} font-medium text-[var(--hs-muted)]`} htmlFor="signin-password">
          Password
        </label>
        <input
          id="signin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={`w-full border border-black/10 bg-white text-[var(--hs-ink)] shadow-inner outline-none focus:border-[var(--hs-accent)] ${
            compact ? "rounded-xl px-3 py-2.5 text-sm" : "rounded-2xl px-4 py-3"
          }`}
        />
      </div>

      <PrimaryButton
        type="submit"
        disabled={pending}
        className={`w-full justify-center bg-[var(--hs-accent-strong)] ${
          compact ? "rounded-xl py-2.5 text-sm" : "py-4 text-lg"
        }`}
      >
        {pending ? "Signing in…" : "Sign in"}
        <span aria-hidden className={compact ? "text-sm" : ""}>→</span>
      </PrimaryButton>

      {showSwitchLink ? (
        <p className={`text-center text-[var(--hs-muted)] ${compact ? "text-xs" : "text-sm"}`}>
          New here?{" "}
          <Link href={switchHref} className="font-medium text-[var(--hs-accent)] underline-offset-4 hover:underline">
            Create an account
          </Link>
        </p>
      ) : null}
    </form>
  );
}
