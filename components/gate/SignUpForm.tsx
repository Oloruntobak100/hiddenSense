"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { syncProfileWithAccessToken } from "@/lib/profile/sync-profile-client";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

export function SignUpForm() {
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
    <form onSubmit={onSubmit} className="flex w-full max-w-md flex-col gap-5">
      {error ? (
        <p
          className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--hs-muted)]" htmlFor="firstName">
          First name
        </label>
        <input
          id="firstName"
          name="firstName"
          autoComplete="given-name"
          required
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-[var(--hs-ink)] shadow-inner outline-none ring-0 focus:border-[var(--hs-accent)]"
          placeholder="Alex"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--hs-muted)]" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-[var(--hs-ink)] shadow-inner outline-none focus:border-[var(--hs-accent)]"
          placeholder="you@example.com"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--hs-muted)]" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-[var(--hs-ink)] shadow-inner outline-none focus:border-[var(--hs-accent)]"
          placeholder="At least 6 characters"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--hs-muted)]" htmlFor="phone">
          Phone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-[var(--hs-ink)] shadow-inner outline-none focus:border-[var(--hs-accent)]"
          placeholder="+1 555 123 4567"
        />
      </div>

      <fieldset className="space-y-3 rounded-2xl border border-black/5 bg-black/[0.02] p-4">
        <legend className="sr-only">Marketing preferences</legend>
        <label className="flex cursor-pointer items-start gap-3 text-sm text-[var(--hs-ink)]">
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
            Email me Hidden Spirits news and pairings.{" "}
            <span className="text-[var(--hs-muted)]">(Recommended)</span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 text-sm text-[var(--hs-ink)]">
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
            Text me offers and drops.{" "}
            <span className="text-[var(--hs-muted)]">(Recommended)</span>
          </span>
        </label>
      </fieldset>

      <PrimaryButton
        type="submit"
        disabled={pending}
        className="w-full justify-center bg-[var(--hs-accent)] py-4 text-lg"
      >
        {pending ? "Sending code…" : "Create account & send code"}
        <span aria-hidden>→</span>
      </PrimaryButton>

      <p className="text-center text-sm text-[var(--hs-muted)]">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[var(--hs-accent)] underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
