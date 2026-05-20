"use client";

import { useEffect } from "react";
import type { MyResultItem } from "@/lib/data/my-results";
import { MyResultsList } from "@/components/results/MyResultsList";

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
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="my-results-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
        aria-label="Close results"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[min(88dvh,40rem)] w-full max-w-lg flex-col overflow-hidden rounded-[1.75rem] border border-white/15 bg-[#151222]/98 shadow-2xl shadow-black/60 backdrop-blur-md">
        <div className="border-b border-white/10 px-5 py-4 sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">History</p>
          <h2
            id="my-results-title"
            className="mt-1 font-[family-name:var(--font-serif)] text-2xl font-semibold text-white"
          >
            My Results
          </h2>
          <p className="mt-1 text-sm text-white/65">
            {displayName}&apos;s past mood pairings and recommendations.
          </p>
        </div>
        <div className="flex-1 overflow-hidden px-5 py-4 sm:px-6">
          <MyResultsList items={items} onItemClick={onClose} />
        </div>
        <div className="border-t border-white/10 px-5 py-3 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-white/20 bg-white/[0.05] py-2.5 text-sm font-medium text-white/90 transition hover:bg-white/10"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
