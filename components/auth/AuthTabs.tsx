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
    <section className="mx-auto w-full max-w-md overflow-hidden rounded-[1.5rem] border border-white/20 bg-[var(--hs-panel)]/95 shadow-2xl shadow-black/40 backdrop-blur-md">
      <div className="p-1.5">
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#09080f]/8 p-1">
          <button
            type="button"
            onClick={() => setMode("signin")}
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
            onClick={() => setMode("signup")}
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
          <SignInForm showSwitchLink={false} compact />
        ) : (
          <SignUpForm showSwitchLink={false} compact />
        )}
      </div>
    </section>
  );
}
