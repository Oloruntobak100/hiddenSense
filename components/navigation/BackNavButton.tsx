"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { getSafeInternalNext } from "@/lib/auth/safe-next";

type Props = {
  /** Used when `?returnTo=` is missing or not allowlisted. */
  fallbackHref: string;
  className?: string;
  label?: string;
};

/**
 * Returns to the previous in-app step when `returnTo` is set on the URL;
 * otherwise uses `fallbackHref` (e.g. result page for feedback flows).
 */
export function BackNavButton({ fallbackHref, className, label = "← Back" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const target = getSafeInternalNext(searchParams.get("returnTo"), fallbackHref);

  return (
    <button
      type="button"
      onClick={() => router.push(target)}
      className={
        className ??
        "inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-white/90 backdrop-blur-sm transition hover:border-white/35 hover:bg-white/[0.1] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hs-accent)]"
      }
    >
      {label}
    </button>
  );
}
