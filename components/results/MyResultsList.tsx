import Link from "next/link";
import type { MyResultItem } from "@/lib/data/my-results";

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function resultHref(item: { sessionId: string; moodResultId: string | null }) {
  const base = `/result/${item.sessionId}`;
  return item.moodResultId ? `${base}?moodResultId=${item.moodResultId}` : base;
}

type MyResultsListProps = {
  items: MyResultItem[];
  emptyCtaHref?: string;
  onItemClick?: () => void;
};

export function MyResultsList({ items, emptyCtaHref = "/quiz", onItemClick }: MyResultsListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-white/12 bg-white/[0.04] p-6 text-center">
        <p className="text-sm text-white/80">You haven&apos;t completed a mood pairing yet.</p>
        <Link
          href={emptyCtaHref}
          onClick={onItemClick}
          className="mt-5 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[var(--hs-accent-strong)] to-[var(--hs-accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_-10px_rgba(124,58,237,0.7)] transition hover:brightness-110"
        >
          Find My Mood
        </Link>
      </div>
    );
  }

  return (
    <ul className="max-h-[min(52vh,28rem)] space-y-2 overflow-y-auto overscroll-contain pr-0.5">
      {items.map((item) => (
        <li key={item.sessionId}>
          <Link
            href={resultHref(item)}
            onClick={onItemClick}
            className="block rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3.5 transition hover:border-white/22 hover:bg-white/[0.08]"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-[family-name:var(--font-serif)] text-lg font-semibold text-white">
                  {item.moodName}
                </p>
                {item.cocktailName ? (
                  <p className="mt-0.5 truncate text-sm text-white/75">{item.cocktailName}</p>
                ) : (
                  <p className="mt-0.5 text-sm text-white/55">Mood pairing</p>
                )}
              </div>
              <span className="shrink-0 text-xs font-medium text-indigo-200">View →</span>
            </div>
            <p className="mt-2 text-[11px] text-white/50">{formatWhen(item.createdAt)}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
