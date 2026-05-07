"use client";

import { useActionState } from "react";
import {
  testerQuickEnter,
  type TesterLoginState,
} from "@/app/actions/tester-login";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

const initial: TesterLoginState = {};

export function TesterLoginForm() {
  const [state, action, pending] = useActionState(testerQuickEnter, initial);

  return (
    <form action={action} className="flex flex-col gap-4">
      {state.error ? (
        <p
          className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-950"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      <PrimaryButton
        type="submit"
        disabled={pending}
        className="w-full justify-center bg-[var(--hs-accent-strong)] py-4 text-lg"
      >
        {pending ? "Starting session…" : "Enter quiz as tester"}
        <span aria-hidden>→</span>
      </PrimaryButton>
      <p className="text-center text-xs text-[var(--hs-muted)]">
        Creates a disposable profile when Supabase is configured; otherwise uses offline UI-demo mode locally.
      </p>
    </form>
  );
}
