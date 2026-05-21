import type { MyResultItem } from "@/lib/data/my-results";
import { resultHref } from "@/components/results/MyResultsList";
import { ViewResultLink } from "@/components/results/ViewResultLink";
import { NavigatingLink } from "@/components/navigation/NavigatingLink";

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

type MyResultsTableProps = {
  items: MyResultItem[];
  emptyCtaHref?: string;
  onItemClick?: () => void;
};

export function MyResultsTable({ items, emptyCtaHref = "/quiz", onItemClick }: MyResultsTableProps) {
  if (items.length === 0) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-white/12 bg-white/[0.03] px-6 py-16 text-center">
        <p className="text-sm text-white/80">You haven&apos;t completed a mood pairing yet.</p>
        <NavigatingLink
          href={emptyCtaHref}
          message="Starting your mood pairing…"
          onClick={onItemClick}
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[var(--hs-accent-strong)] to-[var(--hs-accent)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_-10px_rgba(124,58,237,0.7)] transition hover:brightness-110"
        >
          Find My Mood
        </NavigatingLink>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/12 bg-white/[0.02]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/12 bg-white/[0.04]">
              <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50 sm:px-5">
                Date
              </th>
              <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50 sm:px-5">
                Mood
              </th>
              <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50 sm:px-5">
                Pairing
              </th>
              <th className="px-4 py-3.5 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50 sm:px-5">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr
                key={`${item.sessionId}-${item.moodResultId ?? "none"}`}
                className={`border-b border-white/[0.08] transition hover:bg-white/[0.05] ${i % 2 === 1 ? "bg-white/[0.015]" : ""}`}
              >
                <td className="whitespace-nowrap px-4 py-4 text-white/65 sm:px-5">{formatWhen(item.createdAt)}</td>
                <td className="px-4 py-4 sm:px-5">
                  <span className="font-[family-name:var(--font-serif)] text-base font-semibold text-white">
                    {item.moodName}
                  </span>
                </td>
                <td className="max-w-[14rem] truncate px-4 py-4 text-white/75 sm:max-w-none sm:px-5">
                  {item.cocktailName ?? "—"}
                </td>
                <td className="px-4 py-4 text-right sm:px-5">
                  <ViewResultLink
                    href={resultHref(item)}
                    onNavigate={onItemClick}
                    className="inline-flex min-h-9 items-center justify-center rounded-lg border border-indigo-400/35 bg-indigo-500/15 px-4 py-1.5 text-xs font-semibold text-indigo-100 transition hover:border-indigo-300/50 hover:bg-indigo-500/25"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
