"use client";

import { useState, useTransition } from "react";
import { submitResultFeedback } from "@/app/actions/recommendation";

type Props = {
  moodResultId: string;
};

const options = [
  { id: "absolutely", label: "Absolutely" },
  { id: "close_enough", label: "Close enough" },
  { id: "not_really", label: "Not really" },
] as const;

export function ResultFeedbackChips({ moodResultId }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onPick = (response: (typeof options)[number]["id"]) => {
    setSelected(response);
    startTransition(() => {
      void submitResultFeedback(moodResultId, response);
    });
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-white/70">Did HiddenSense™ understand your mood tonight?</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onPick(opt.id)}
            disabled={pending}
            className={`touch-manipulation rounded-full border px-4 py-2.5 text-[13px] font-medium transition sm:py-2 sm:text-xs ${
              selected === opt.id
                ? "border-[var(--hs-accent)] bg-[var(--hs-accent)]/20 text-white"
                : "border-white/20 bg-white/[0.04] text-white/80 hover:bg-white/[0.1]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
