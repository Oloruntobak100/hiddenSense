"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { submitResultFeedback } from "@/app/actions/recommendation";

type Props = {
  moodResultId: string;
  sessionId: string;
};

const options = [
  {
    id: "absolutely" as const,
    label: "Absolutely",
    blurb: "Nailed it",
    icon: (
      <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none" aria-hidden>
        <circle cx="24" cy="24" r="20" className="stroke-emerald-400/90" strokeWidth="2" />
        <path d="M14 26c2.5 3 5.5 5 10 5s8-2 10-5" className="stroke-emerald-300" strokeWidth="2" strokeLinecap="round" />
        <circle cx="17" cy="19" r="2" className="fill-emerald-200/90" />
        <circle cx="31" cy="19" r="2" className="fill-emerald-200/90" />
      </svg>
    ),
  },
  {
    id: "close_enough" as const,
    label: "Close enough",
    blurb: "In the ballpark",
    icon: (
      <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none" aria-hidden>
        <circle cx="24" cy="24" r="20" className="stroke-sky-400/85" strokeWidth="2" />
        <path d="M16 22h16" className="stroke-sky-200" strokeWidth="2" strokeLinecap="round" />
        <circle cx="17" cy="17" r="2" className="fill-sky-200/85" />
        <circle cx="31" cy="17" r="2" className="fill-sky-200/85" />
      </svg>
    ),
  },
  {
    id: "not_really" as const,
    label: "Not really",
    blurb: "Off tonight",
    icon: (
      <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none" aria-hidden>
        <circle cx="24" cy="24" r="20" className="stroke-amber-400/80" strokeWidth="2" />
        <path d="M16 30c2.5-2.5 5.5-4 8-4s5.5 1.5 8 4" className="stroke-amber-200/90" strokeWidth="2" strokeLinecap="round" />
        <circle cx="17" cy="18" r="2" className="fill-amber-200/80" />
        <circle cx="31" cy="18" r="2" className="fill-amber-200/80" />
      </svg>
    ),
  },
];

export function MoodAccuracyFeedback({ moodResultId, sessionId }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<(typeof options)[number]["id"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function pick(id: (typeof options)[number]["id"]) {
    setError(null);
    setSelected(id);
    startTransition(() => {
      void (async () => {
        const res = await submitResultFeedback(moodResultId, id);
        if (!res.ok) {
          setError(res.error);
          return;
        }
        router.push(`/feedback/${sessionId}`);
        router.refresh();
      })();
    });
  }

  return (
    <div className="space-y-8">
      <p className="text-center text-lg text-white/85 sm:text-xl">Did HiddenSense™ understand your mood tonight?</p>
      {error ? (
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-100" role="alert">
          {error}
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-3">
        {options.map((opt, i) => {
          const active = selected === opt.id;
          return (
            <motion.button
              key={opt.id}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 * i, duration: 0.35 }}
              disabled={pending}
              onClick={() => pick(opt.id)}
              className={`flex flex-col items-center rounded-2xl border px-4 py-6 text-center transition ${
                active
                  ? "border-[var(--hs-accent)] bg-[var(--hs-accent)]/15 shadow-[0_0_0_1px_rgba(99,102,241,0.35)]"
                  : "border-white/12 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.07]"
              } disabled:opacity-50`}
            >
              <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-black/25">{opt.icon}</span>
              <span className="font-[family-name:var(--font-serif)] text-lg font-semibold text-white">{opt.label}</span>
              <span className="mt-1 text-xs text-white/55">{opt.blurb}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
