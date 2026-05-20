"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { getSafeInternalNext } from "@/lib/auth/safe-next";
import { writeQuizLastAuthEmail } from "@/lib/auth/quiz-auth-cue";
import { checkRegisteredEmail } from "@/app/actions/auth-email-lookup";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

type SignInFormProps = {
  showSwitchLink?: boolean;
  switchHref?: string;
  compact?: boolean;
  /** When set, overrides `?next=` for post-verification redirect. */
  authNextPath?: string;
  showHomeLink?: boolean;
  /** Prefill email (e.g. last OTP on this tab). */
  defaultEmailHint?: string;
  /** When the email is not registered, switch to sign-up instead of only showing an error. */
  onSuggestSignUp?: (email: string) => void;
};

export function SignInForm({
  showSwitchLink = true,
  switchHref = "/login?mode=signup",
  compact = false,
  authNextPath: authNextPathProp,
  showHomeLink = true,
  defaultEmailHint = "",
  onSuggestSignUp,
}: SignInFormProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = authNextPathProp
    ? getSafeInternalNext(authNextPathProp, "/dashboard")
    : getSafeInternalNext(searchParams.get("next"), "/dashboard");

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [pendingPhase, setPendingPhase] = useState<"idle" | "check" | "send">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    setPendingPhase("check");

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();

    try {
      const supabase = createBrowserSupabaseClient();

      const lookup = await checkRegisteredEmail(email);
      if (!lookup.ok) {
        setError(lookup.error);
        return;
      }
      if (!lookup.registered) {
        if (onSuggestSignUp) {
          writeQuizLastAuthEmail(email);
          onSuggestSignUp(email);
          return;
        }
        setError("We don't have an account for that email yet. Open the Sign up tab to create one.");
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.email) {
        if (session.user.email.toLowerCase() === email.toLowerCase()) {
          writeQuizLastAuthEmail(email);
          router.push(nextPath);
          router.refresh();
          return;
        }
        setError(
          `You're signed in as ${session.user.email}. Sign out first if you need to use a different email.`,
        );
        return;
      }

      setPendingPhase("send");

      const { error: signErr } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      });

      if (signErr) {
        const msg = signErr.message.toLowerCase().includes("rate")
          ? "Too many sign-in emails were sent recently. Wait a few minutes, or check your inbox for an existing code."
          : signErr.message;
        setError(msg);
        return;
      }

      writeQuizLastAuthEmail(email);

      const verifyQs = new URLSearchParams({
        email,
        next: nextPath,
        flow: "signin",
      });
      router.push(`/verify?${verifyQs.toString()}`);
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setPending(false);
      setPendingPhase("idle");
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
          key={defaultEmailHint || "email-empty"}
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={defaultEmailHint}
          className="w-full rounded-xl border border-black/[0.09] bg-white px-3.5 py-2.5 text-[15px] leading-snug text-[var(--hs-ink)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] outline-none placeholder:text-black/35 focus:border-[var(--hs-accent)] focus:ring-2 focus:ring-[var(--hs-accent)]/18"
          placeholder="you@example.com"
        />
      </div>

      <PrimaryButton
        type="submit"
        loading={pending}
        disabled={pending}
        className={`w-full justify-center rounded-xl bg-[var(--hs-accent)] font-semibold shadow-[0_12px_28px_-8px_rgba(37,99,235,0.55)] ${
          compact ? "py-2.5 text-sm" : "py-3 text-[15px]"
        }`}
      >
        {pending
          ? pendingPhase === "check"
            ? "Checking…"
            : "Sending code…"
          : "Sign in"}
      </PrimaryButton>

      {showSwitchLink ? (
        <p className="text-center text-[13px] text-[var(--hs-muted)]">
          New here?{" "}
          <Link href={switchHref} className="font-semibold text-[var(--hs-accent)] underline-offset-[3px] hover:underline">
            Create an account
          </Link>
        </p>
      ) : null}

      {showHomeLink ? (
      <p className="text-center text-[12px] text-[var(--hs-muted)]">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="font-medium text-[var(--hs-accent)] underline-offset-2 hover:underline"
        >
          Back to home
        </button>
      </p>
      ) : null}
    </form>
  );
}
