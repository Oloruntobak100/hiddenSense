"use client";

import { useTransition } from "react";
import { logRecommendationClick } from "@/app/actions/recommendation";

type Props = {
  moodResultId?: string | null;
  recommendationId?: string | null;
  checkoutUrl?: string | null;
};

export function PurchaseCta({ moodResultId, recommendationId, checkoutUrl }: Props) {
  const [pending, startTransition] = useTransition();

  const onClick = () => {
    if (moodResultId) {
      startTransition(() => {
        void logRecommendationClick(moodResultId, recommendationId);
      });
    }
    if (checkoutUrl) {
      window.open(checkoutUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[var(--hs-accent-strong)] to-[var(--hs-accent)] px-8 py-3.5 text-sm font-semibold text-white shadow-[0_20px_45px_-20px_rgba(124,58,237,0.85)] transition hover:brightness-110 disabled:opacity-60"
    >
      {pending ? "Redirecting…" : "Proceed to checkout"}
    </button>
  );
}
