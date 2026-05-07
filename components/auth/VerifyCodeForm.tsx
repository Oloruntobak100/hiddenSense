"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { ensureProfileAfterAuth } from "@/app/actions/profile";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

type Props = {
  email: string;
};

export function VerifyCodeForm({ email }: Props) {
  const router = useRouter();
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
      setError("Paste the verification code from your email.");
      setPending(false);
      return;
    }

    try {
      const supabase = createBrowserSupabaseClient();

      let authErr = (
        await supabase.auth.verifyOtp({
          email,
          token,
          type: "signup",
        })
      ).error;

      if (authErr) {
        const second = await supabase.auth.verifyOtp({
          email,
          token,
          type: "email",
        });
        authErr = second.error;
      }

      if (authErr) {
        setError(authErr.message);
        setPending(false);
        return;
      }

      const ensured = await ensureProfileAfterAuth();
      if (!ensured.ok) {
        setError(ensured.error);
        setPending(false);
        return;
      }

      router.replace("/quiz");
      router.refresh();
    } catch {
      setError("Verification failed. Try again.");
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
        <label className="text-sm font-medium text-[var(--hs-muted)]" htmlFor="code">
          Verification code
        </label>
        <textarea
          id="code"
          name="code"
          required
          rows={3}
          autoComplete="one-time-code"
          placeholder="Paste the code from your email (any length)"
          className="w-full resize-y rounded-2xl border border-black/10 bg-white px-4 py-3 font-mono text-base text-[var(--hs-ink)] shadow-inner outline-none focus:border-[var(--hs-accent)]"
        />
        <p className="text-xs text-[var(--hs-muted)]">
          Spaces are ignored. Use the full code Supabase sent you.
        </p>
      </div>

      <PrimaryButton
        type="submit"
        disabled={pending}
        className="w-full justify-center bg-[var(--hs-accent-strong)] py-4 text-lg"
      >
        {pending ? "Verifying…" : "Verify & continue"}
        <span aria-hidden>→</span>
      </PrimaryButton>

      <p className="text-center text-sm text-[var(--hs-muted)]">
        Wrong email?{" "}
        <Link href="/gate" className="underline-offset-4 hover:underline">
          Back to sign up
        </Link>
      </p>
    </form>
  );
}
