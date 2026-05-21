"use client";

import { useEffect } from "react";
import type { MyResultItem } from "@/lib/data/my-results";
import { DASHBOARD_RESULTS_RETURN } from "@/components/results/MyResultsList";
import { MyResultsTable } from "@/components/results/MyResultsTable";

type MyResultsModalProps = {
  open: boolean;
  onClose: () => void;
  items: MyResultItem[];
  displayName: string;
};

export function MyResultsModal({ open, onClose, items, displayName }: MyResultsModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-[#0a0911]/98 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="my-results-title"
    >
      <header className="shrink-0 border-b border-white/10 px-5 py-5 sm:px-8 sm:py-6">
        <div className="mx-auto flex w-full max-w-6xl items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">History</p>
            <h2
              id="my-results-title"
              className="mt-1 font-[family-name:var(--font-serif)] text-2xl font-semibold text-white sm:text-3xl"
            >
              My Results
            </h2>
            <p className="mt-1 text-sm text-white/65">
              {displayName}&apos;s past mood pairings — select View to open the full reveal.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-xl border border-white/20 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white/12"
          >
            Close
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto w-full max-w-6xl">
          <MyResultsTable
            items={items}
            historyReturnTo={DASHBOARD_RESULTS_RETURN}
            onItemClick={onClose}
          />
        </div>
      </div>
    </div>
  );
}
