"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/gate/SignUpForm";

type AuthMode = "signin" | "signup";

export function AuthTabs() {
  const searchParams = useSearchParams();
  const modeFromUrl = (searchParams.get("mode") ?? "").toLowerCase();

  const initialMode = useMemo<AuthMode>(
    () => (modeFromUrl === "signup" ? "signup" : "signin"),
    [modeFromUrl],
  );
  const [mode, setMode] = useState<AuthMode>(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  return (
    <section className="mx-auto w-full max-w-md overflow-hidden rounded-[1.75rem] border border-white/15 bg-[var(--hs-panel)]/95 shadow-2xl shadow-black/40 backdrop-blur-md">
      <div className="p-2">
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-[#09080f]/6 p-1">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
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
            onClick={() => setMode("signup")}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
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

      <div className="border-t border-black/5 p-6 sm:p-7">
        {mode === "signin" ? <SignInForm showSwitchLink={false} /> : <SignUpForm showSwitchLink={false} />}
      </div>
    </section>
  );
}
