"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { setAgeConsentCookie } from "@/app/actions/age-consent";
import type { AgeConsentValue } from "@/lib/auth/age-consent";
import { LogoMark } from "@/components/brand/Logo";

type Intent = "quiz" | "login";

type Props = {
  children: (open: (intent: Intent) => void) => ReactNode;
};

function AgeConsentLeavingView({ destination }: { destination: "quiz" | "login" }) {
  const copy =
    destination === "quiz"
      ? "Opening your mood journey…"
      : "Taking you to sign in…";

  return (
    <div className="flex w-full max-w-lg flex-col items-center justify-center px-8 py-16 text-center sm:py-20">
      <h2 id="age-gate-title" className="sr-only">
        {destination === "quiz" ? "Opening quiz" : "Opening sign in"}
      </h2>
      <div className="relative mb-12 h-28 w-28">
        <div aria-hidden className="hs-age-orbit absolute inset-0 rounded-full bg-[var(--hs-accent)]/20 blur-xl" />
        <div
          aria-hidden
          className="hs-age-orbit-rev absolute inset-0 scale-110 rounded-full border border-white/10 bg-gradient-to-br from-[var(--hs-accent-strong)]/25 via-transparent to-[var(--hs-accent)]/20 opacity-80"
        />
        <div className="relative flex h-full w-full items-center justify-center rounded-full border border-white/15 bg-[#15101f]/90 shadow-[0_0_40px_-8px_rgba(124,58,237,0.55)]">
          <LogoMark className="h-12 w-10 object-contain opacity-95" />
        </div>
      </div>
      <p className="max-w-sm font-[family-name:var(--font-serif)] text-[clamp(1.15rem,4vw,1.65rem)] font-semibold leading-snug tracking-tight text-white">
        {copy}
      </p>
      <p className="mt-4 max-w-[18rem] text-sm leading-relaxed text-white/60">
        Preparing your HiddenSense™ session—this screen will hand off as soon as the next page is ready.
      </p>
      <div className="mt-10 flex items-center gap-2" aria-hidden>
        <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-[var(--hs-accent)] shadow-[0_0_12px_rgba(37,99,235,0.8)] [animation-delay:-0.2s]" />
        <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.65)] [animation-delay:-0.1s]" />
        <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-white/80 [animation-delay:0s]" />
      </div>
    </div>
  );
}

export function AgeConsentGate({ children }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [intent, setIntent] = useState<Intent>("quiz");
  const [terms, setTerms] = useState(false);
  const [age, setAge] = useState<AgeConsentValue | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** After cookie save: keep overlay up with loader until route change unmounts (avoid homepage flash). */
  const [leaving, setLeaving] = useState(false);

  const launch = useCallback((nextIntent: Intent) => {
    setIntent(nextIntent);
    setTerms(false);
    setAge(null);
    setError(null);
    setLeaving(false);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    if (pending || leaving) return;
    setOpen(false);
  }, [pending, leaving]);

  async function onContinue() {
    setError(null);
    if (!terms) {
      setError("Please confirm you agree to the terms to continue.");
      return;
    }
    if (!age) {
      setError("Please select whether you are 21 or older.");
      return;
    }
    setPending(true);
    try {
      const res = await setAgeConsentCookie(age);
      if (!res.ok) {
        setError("Could not save your choice. Try again.");
        return;
      }
      setLeaving(true);
      if (intent === "quiz") {
        router.push("/quiz");
      } else {
        router.push("/login");
      }
    } catch {
      setError("Something went wrong. Try again.");
      setLeaving(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      {children(launch)}
      {open ? (
        <div
          className={`fixed inset-0 z-[100] flex items-end justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-12 backdrop-blur-md sm:items-center sm:p-6 ${
            leaving ? "bg-[#07060c]/95" : "bg-black/70"
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="age-gate-title"
          aria-busy={leaving || undefined}
        >
          {leaving ? (
            <AgeConsentLeavingView destination={intent === "quiz" ? "quiz" : "login"} />
          ) : (
          <div className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/15 bg-[#12101c] p-6 text-left text-white shadow-2xl shadow-black/50 sm:rounded-3xl sm:p-8">
            <h2 id="age-gate-title" className="font-[family-name:var(--font-serif)] text-xl font-semibold tracking-tight sm:text-2xl">
              Before you continue
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              HiddenSense™ pairs moods with Hidden Spirits experiences. We need to confirm you understand how we use your information and your age for responsible recommendations.
            </p>

            <label className="mt-6 flex cursor-pointer gap-3 rounded-xl border border-white/12 bg-white/[0.04] p-4">
              <input
                type="checkbox"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/30 accent-[var(--hs-accent)]"
              />
              <span className="text-sm text-white/85">
                I agree to the{" "}
                <a href="/terms" className="text-[var(--hs-accent)] underline-offset-2 hover:underline">
                  terms
                </a>{" "}
                and{" "}
                <a href="/privacy" className="text-[var(--hs-accent)] underline-offset-2 hover:underline">
                  privacy policy
                </a>
                .
              </span>
            </label>

            <fieldset className="mt-5 space-y-2">
              <legend className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">Age</legend>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 has-[:checked]:border-[var(--hs-accent)]/50 has-[:checked]:bg-[var(--hs-accent)]/10">
                <input
                  type="radio"
                  name="age"
                  checked={age === "adult"}
                  onChange={() => setAge("adult")}
                  className="accent-[var(--hs-accent)]"
                />
                <span className="text-sm font-medium">I am 21 or older</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 has-[:checked]:border-[var(--hs-accent)]/50 has-[:checked]:bg-[var(--hs-accent)]/10">
                <input
                  type="radio"
                  name="age"
                  checked={age === "minor"}
                  onChange={() => setAge("minor")}
                  className="accent-[var(--hs-accent)]"
                />
                <span className="text-sm font-medium">I am under 21</span>
              </label>
            </fieldset>

            {error ? (
              <p className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-100" role="alert">
                {error}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row-reverse sm:justify-end">
              <button
                type="button"
                onClick={() => void onContinue()}
                disabled={pending || leaving}
                className="min-h-11 rounded-xl bg-[var(--hs-accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:brightness-110 disabled:opacity-50"
              >
                {pending ? "…" : "Continue"}
              </button>
              <button
                type="button"
                onClick={close}
                disabled={pending || leaving}
                className="min-h-11 rounded-xl border border-white/20 px-5 py-2.5 text-sm font-medium text-white/85 hover:bg-white/10 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
          )}
        </div>
      ) : null}
    </>
  );
}
