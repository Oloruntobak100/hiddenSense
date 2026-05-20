import Link from "next/link";
import { ensureProfileId } from "@/lib/auth/ensure-profile";
import { listMyResults } from "@/lib/data/my-results";
import { MyResultsList } from "@/components/results/MyResultsList";

export const dynamic = "force-dynamic";

export default async function MyResultsPage() {
  const profileId = await ensureProfileId();
  const items = profileId ? await listMyResults() : [];

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

        <div className="mt-8">
          <MyResultsList items={items} />
        </div>

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
