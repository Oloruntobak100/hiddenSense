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
};

export function SignInForm({ showSwitchLink = true, switchHref = "/login?mode=signup" }: SignInFormProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/quiz";

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

      const safeNext = nextPath.startsWith("/") ? nextPath : "/quiz";
      router.replace(safeNext);
      router.refresh();
    } catch {
      setError("Sign-in failed. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-5">
      {error ? (
        <p
          className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--hs-muted)]" htmlFor="signin-email">
          Email
        </label>
        <input
          id="signin-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-[var(--hs-ink)] shadow-inner outline-none focus:border-[var(--hs-accent)]"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--hs-muted)]" htmlFor="signin-password">
          Password
        </label>
        <input
          id="signin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-[var(--hs-ink)] shadow-inner outline-none focus:border-[var(--hs-accent)]"
        />
      </div>

      <PrimaryButton
        type="submit"
        disabled={pending}
        className="w-full justify-center bg-[var(--hs-accent-strong)] py-4 text-lg"
      >
        {pending ? "Signing in…" : "Sign in"}
        <span aria-hidden>→</span>
      </PrimaryButton>

      {showSwitchLink ? (
        <p className="text-center text-sm text-[var(--hs-muted)]">
          New here?{" "}
          <Link href={switchHref} className="font-medium text-[var(--hs-accent)] underline-offset-4 hover:underline">
            Create an account
          </Link>
        </p>
      ) : null}
    </form>
  );
}
