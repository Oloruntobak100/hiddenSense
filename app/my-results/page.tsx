import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentProfileId } from "@/lib/auth/current-profile";
import { listMyResults } from "@/lib/data/my-results";

export const dynamic = "force-dynamic";

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function resultHref(item: { sessionId: string; moodResultId: string | null }) {
  const base = `/result/${item.sessionId}`;
  return item.moodResultId ? `${base}?moodResultId=${item.moodResultId}` : base;
}

export default async function MyResultsPage() {
  const profileId = await getCurrentProfileId();
  if (!profileId) notFound();

  const items = await listMyResults();

  return (
    <main className="relative min-h-[100dvh] overflow-hidden px-5 py-10 sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(160deg,#0a0911_12%,#151024_45%,#1d131a_72%,#0d0b14_100%),radial-gradient(130%_110%_at_18%_12%,rgba(124,58,237,0.22),transparent_52%)]"
      />
      <div className="mx-auto w-full max-w-2xl">
        <p className="text-xs uppercase tracking-[0.16em] text-white/55">History</p>
        <h1 className="mt-3 font-[family-name:var(--font-serif)] text-4xl font-semibold tracking-tight text-white">
          My Results
        </h1>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/70">
          Your past mood pairings and recommendations. Open any result to see the full reveal again.
        </p>

        {items.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-white/12 bg-white/[0.04] p-8 text-center shadow-2xl shadow-black/40 backdrop-blur-md">
            <p className="text-white/80">You haven&apos;t completed a mood pairing yet.</p>
            <Link
              href="/quiz"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[var(--hs-accent-strong)] to-[var(--hs-accent)] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_-10px_rgba(124,58,237,0.7)] transition hover:brightness-110"
            >
              Find My Mood
            </Link>
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {items.map((item) => (
              <li key={item.sessionId}>
                <Link
                  href={resultHref(item)}
                  className="block rounded-2xl border border-white/12 bg-white/[0.04] px-5 py-4 shadow-lg shadow-black/25 backdrop-blur-md transition hover:border-white/22 hover:bg-white/[0.08]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-[family-name:var(--font-serif)] text-xl font-semibold text-white">
                        {item.moodName}
                      </p>
                      {item.cocktailName ? (
                        <p className="mt-1 truncate text-sm text-white/75">{item.cocktailName}</p>
                      ) : (
                        <p className="mt-1 text-sm text-white/55">Mood pairing</p>
                      )}
                    </div>
                    <span className="shrink-0 rounded-full border border-[var(--hs-accent)]/35 bg-[var(--hs-accent)]/15 px-3 py-1 text-xs font-medium text-indigo-100">
                      View result →
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-white/50">{formatWhen(item.createdAt)}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-10">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-white/90 transition hover:bg-white/[0.1]"
          >
            ← Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
