"use client";

import { useTransition } from "react";
import { logRecommendationClick } from "@/app/actions/recommendation";

type Props = {
  moodResultId?: string | null;
  recommendationId?: string | null;
  /** Primary: Square checkout link from listing */
  squareCheckoutUrl?: string | null;
  checkoutUrl?: string | null;
  /** Under-21 profile: hide alcohol checkout */
  isMinor?: boolean;
};

export function PurchaseCta({
  moodResultId,
  recommendationId,
  squareCheckoutUrl,
  checkoutUrl,
  isMinor = false,
}: Props) {
  const [pending, startTransition] = useTransition();
  const url = squareCheckoutUrl ?? checkoutUrl ?? null;
  const hasUrl = Boolean(url?.trim());

  const sharedClass =
    "inline-flex min-h-12 w-full items-center justify-center rounded-2xl px-8 py-3.5 text-[15px] font-semibold shadow-[0_20px_45px_-20px_rgba(124,58,237,0.85)] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hs-accent)] sm:w-auto sm:min-w-[220px]";

  const logClick = () => {
    if (!moodResultId) return;
    startTransition(() => {
      void logRecommendationClick(moodResultId, recommendationId);
    });
  };

  if (isMinor) {
    return (
      <p className="max-w-xl rounded-2xl border border-white/12 bg-white/[0.04] px-5 py-4 text-sm leading-relaxed text-white/70">
        Alcohol checkout isn&apos;t shown for under-21 visits—enjoy the food inspiration and zero-proof framing tonight.
      </p>
    );
  }

  if (hasUrl && url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => logClick()}
        aria-busy={pending}
        className={`bg-gradient-to-r from-[var(--hs-accent-strong)] to-[var(--hs-accent)] text-white ${sharedClass}`}
      >
        {pending ? "Opening checkout…" : "Proceed to checkout"}
      </a>
    );
  }

  return (
    <button
      type="button"
      disabled
      title="Checkout link not configured for this pairing."
      className={`cursor-not-allowed bg-white/10 text-white/45 ${sharedClass}`}
    >
      Checkout unavailable
    </button>
  );
}
