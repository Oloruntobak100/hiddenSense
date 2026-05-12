"use client";

import { FormSubmitButton } from "@/components/ui/FormSubmitButton";
import { submitFeedback } from "@/app/actions/feedback";

export function FeedbackForm({ sessionId }: { sessionId: string }) {
  return (
    <form action={(fd) => submitFeedback(sessionId, fd)} className="flex w-full flex-col gap-7">
      <fieldset className="space-y-3">
        <legend className="text-base font-semibold text-[var(--hs-ink)]">Did the mood feel accurate?</legend>
        <div className="flex flex-wrap gap-3">
          <label className="flex cursor-pointer items-center gap-2.5 rounded-2xl border border-black/15 bg-white px-5 py-3.5 text-base font-semibold text-[var(--hs-ink)] has-[:checked]:border-[var(--hs-accent)] has-[:checked]:bg-[var(--hs-accent)]/10 focus-within:ring-2 focus-within:ring-[var(--hs-accent)]/35 focus-within:ring-offset-2 focus-within:ring-offset-[var(--hs-panel)]">
            <input type="radio" name="moodAccurate" value="yes" required className="accent-[var(--hs-accent)]" />
            Yes
          </label>
          <label className="flex cursor-pointer items-center gap-2.5 rounded-2xl border border-black/15 bg-white px-5 py-3.5 text-base font-semibold text-[var(--hs-ink)] has-[:checked]:border-[var(--hs-accent)] has-[:checked]:bg-[var(--hs-accent)]/10 focus-within:ring-2 focus-within:ring-[var(--hs-accent)]/35 focus-within:ring-offset-2 focus-within:ring-offset-[var(--hs-panel)]">
            <input type="radio" name="moodAccurate" value="no" className="accent-[var(--hs-accent)]" />
            No
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-base font-semibold text-[var(--hs-ink)]">Pairing quality (1–5)</legend>
        <p className="text-sm text-[var(--hs-muted)]">One tap — highest score is selected by default.</p>
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {(
            [
              { n: 5, short: "5", hint: "Outstanding" },
              { n: 4, short: "4", hint: "Great" },
              { n: 3, short: "3", hint: "Solid" },
              { n: 2, short: "2", hint: "Okay" },
              { n: 1, short: "1", hint: "Needs work" },
            ] as const
          ).map(({ n, short, hint }) => (
            <label
              key={n}
              className="flex cursor-pointer flex-col items-center justify-center gap-0.5 rounded-2xl border border-black/12 bg-white px-1 py-3 text-center has-[:checked]:border-[var(--hs-accent)] has-[:checked]:bg-[var(--hs-accent)]/12 focus-within:ring-2 focus-within:ring-[var(--hs-accent)]/40 focus-within:ring-offset-2 focus-within:ring-offset-[var(--hs-panel)] sm:min-h-[5.25rem] sm:py-3.5"
            >
              <input
                type="radio"
                name="rating"
                value={n}
                defaultChecked={n === 5}
                required={n === 5}
                className="sr-only"
              />
              <span className="text-lg font-bold tabular-nums text-[var(--hs-ink)]">{short}</span>
              <span className="max-w-[4.5rem] truncate text-[10px] font-medium leading-tight text-[var(--hs-ink)]/80 sm:max-w-none">{hint}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="space-y-2">
        <label className="text-base font-semibold text-[var(--hs-ink)]" htmlFor="comment">
          Comments{" "}
          <span className="font-normal text-[var(--hs-muted)]">(optional)</span>
        </label>
        <textarea
          id="comment"
          name="comment"
          rows={4}
          maxLength={2000}
          className="w-full resize-y rounded-2xl border border-black/10 bg-white px-4 py-3 text-[var(--hs-ink)] outline-none focus:border-[var(--hs-accent)]"
          placeholder="What felt right — or totally off?"
        />
      </div>

      <FormSubmitButton className="w-full justify-center py-4">Submit feedback</FormSubmitButton>
    </form>
  );
}
