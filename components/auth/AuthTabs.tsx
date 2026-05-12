"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/gate/SignUpForm";

type AuthMode = "signin" | "signup";

type AuthTabsProps = {
  /** `/login` uses URL `?mode=`; modals use local state only. */
  variant?: "page" | "embedded";
  /** Allowlisted post-auth path (e.g. `/quiz/complete`). */
  authNextPath?: string;
  /** Initial tab when `variant` is `embedded`. */
  defaultMode?: AuthMode;
  /** Prefill sign-in email (sessionStorage hint on this device). */
  defaultEmailHint?: string;
};

export function AuthTabs({
  variant = "page",
  authNextPath,
  defaultMode = "signin",
  defaultEmailHint = "",
}: AuthTabsProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [embeddedMode, setEmbeddedMode] = useState<AuthMode>(defaultMode);
  const [signUpEmailPrefill, setSignUpEmailPrefill] = useState("");

  const pageMode = useMemo<AuthMode>(
    () => ((searchParams.get("mode") ?? "").toLowerCase() === "signup" ? "signup" : "signin"),
    [searchParams],
  );

  const mode = variant === "embedded" ? embeddedMode : pageMode;

  function goMode(next: AuthMode) {
    if (next === "signin") {
      setSignUpEmailPrefill("");
    }
    if (variant === "embedded") {
      setEmbeddedMode(next);
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    if (next === "signup") {
      params.set("mode", "signup");
    } else {
      params.delete("mode");
    }
    const q = params.toString();
    router.replace(q ? `/login?${q}` : "/login");
  }

  return (
    <section className="mx-auto w-full max-w-md overflow-hidden rounded-[1.5rem] border border-white/20 bg-[var(--hs-panel)]/95 shadow-2xl shadow-black/40 backdrop-blur-md">
      <div className="p-1.5">
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#09080f]/8 p-1">
          <button
            type="button"
            onClick={() => goMode("signin")}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              mode === "signin"
                ? "bg-white text-[var(--hs-ink)] shadow-md shadow-black/15"
                : "text-[var(--hs-muted)] hover:text-[var(--hs-ink)]"
            }`}
            aria-pressed={mode === "signin"}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => goMode("signup")}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              mode === "signup"
                ? "bg-white text-[var(--hs-ink)] shadow-md shadow-black/15"
                : "text-[var(--hs-muted)] hover:text-[var(--hs-ink)]"
            }`}
            aria-pressed={mode === "signup"}
          >
            Sign Up
          </button>
        </div>
      </div>

      <div className="border-t border-black/5 p-4 sm:p-5">
        {mode === "signin" ? (
          <Suspense fallback={<p className="text-center text-sm text-[var(--hs-muted)]">Loading…</p>}>
            <SignInForm
              showSwitchLink={false}
              compact
              authNextPath={authNextPath}
              showHomeLink={variant === "page"}
              defaultEmailHint={defaultEmailHint}
              onSuggestSignUp={(email) => {
                setSignUpEmailPrefill(email);
                goMode("signup");
              }}
            />
          </Suspense>
        ) : (
          <Suspense fallback={<p className="text-center text-sm text-[var(--hs-muted)]">Loading…</p>}>
            <SignUpForm
              showSwitchLink={false}
              compact
              authNextPath={authNextPath}
              passwordless={variant === "embedded"}
              defaultEmailHint={signUpEmailPrefill}
            />
          </Suspense>
        )}
      </div>
    </section>
  );
}
