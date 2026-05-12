"use client";

import { FormSubmitButton } from "@/components/ui/FormSubmitButton";
import { submitFeedback } from "@/app/actions/feedback";

export function FeedbackForm({ sessionId }: { sessionId: string }) {
  return (
    <form action={(fd) => submitFeedback(sessionId, fd)} className="flex w-full flex-col gap-7">
      <fieldset className="space-y-3">
        <legend className="text-base font-semibold text-[var(--hs-ink)]">Did the mood feel accurate?</legend>
        <div className="flex flex-wrap gap-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-black/10 px-5 py-3 has-[:checked]:border-[var(--hs-accent)] has-[:checked]:bg-[var(--hs-accent)]/10">
            <input type="radio" name="moodAccurate" value="yes" required className="accent-[var(--hs-accent)]" />
            Yes
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-black/10 px-5 py-3 has-[:checked]:border-[var(--hs-accent)] has-[:checked]:bg-[var(--hs-accent)]/10">
            <input type="radio" name="moodAccurate" value="no" required className="accent-[var(--hs-accent)]" />
            No
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <label className="text-base font-semibold text-[var(--hs-ink)]" htmlFor="rating">
          Pairing quality (1–5)
        </label>
        <select
          id="rating"
          name="rating"
          required
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-[var(--hs-ink)] outline-none focus:border-[var(--hs-accent)]"
          defaultValue="5"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} — {n === 5 ? "Outstanding" : n === 1 ? "Needs work" : "Solid"}
            </option>
          ))}
        </select>
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
