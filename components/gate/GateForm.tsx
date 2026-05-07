"use client";

import { useActionState } from "react";
import { submitGate, type GateState } from "@/app/actions/profile";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

const initial: GateState = {};

export function GateForm() {
  const [state, action, pending] = useActionState(submitGate, initial);

  return (
    <form action={action} className="flex w-full max-w-md flex-col gap-5">
      {state.error ? (
        <p
          className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100"
          role="alert"
        >
          {state.error}
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
            <input type="hidden" name="emailOptIn" value="false" />
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
            <input type="hidden" name="smsOptIn" value="false" />
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
        {pending ? "Unlocking…" : "Unlock My Experience"}
        <span aria-hidden>→</span>
      </PrimaryButton>
    </form>
  );
}
