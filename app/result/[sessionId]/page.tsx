import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DEMO_SESSION_ID } from "@/lib/session/constants";
import { getDemoResultPayload } from "@/lib/session/demo";
import { getQuizSessionForProfile } from "@/lib/data/quiz-session";
import { MOOD_FEELINGS } from "@/lib/catalog/moods";
import { getRecommendation } from "@/lib/catalog/recommendations";
import { getCurrentProfileId } from "@/lib/auth/current-profile";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { PurchaseCta } from "@/components/result/PurchaseCta";
import { ResultFeedbackChips } from "@/components/result/ResultFeedbackChips";

export const dynamic = "force-dynamic";

type MoodResultView = {
  id: string;
  ai_reasoning: string;
  recommendation_source: string;
  recommendation_id: string | null;
  recommendation_payload: {
    cocktailName?: string;
    flavorNotes?: string;
    foodPairings?: string[];
    description?: string;
    alcoholCategory?: string;
    imageUrl?: string | null;
    squareCheckoutUrl?: string | null;
    tasteLane?: "lemon" | "strawberry" | "apple";
    secondary?: Array<{ cocktailName: string; flavorNotes: string }>;
  };
};

function tasteLaneLabel(lane: "lemon" | "strawberry" | "apple") {
  return lane.charAt(0).toUpperCase() + lane.slice(1);
}

export default async function ResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ moodResultId?: string }>;
}) {
  const [{ sessionId }, qs] = await Promise.all([params, searchParams]);
  const profileId = await getCurrentProfileId();
  if (!profileId) {
    notFound();
  }

  type RowLite = {
    id: string;
    mood_key: string;
    mood_name: string;
  };

  let row: RowLite;

  if (sessionId === DEMO_SESSION_ID) {
    const demo = await getDemoResultPayload();
    if (!demo) {
      notFound();
    }
    row = {
      id: DEMO_SESSION_ID,
      mood_key: demo.mood_key,
      mood_name: demo.mood_name,
    };
  } else {
    const dbRow = await getQuizSessionForProfile(sessionId);
    if (!dbRow) {
      notFound();
    }
    row = {
      id: dbRow.id,
      mood_key: dbRow.mood_key,
      mood_name: dbRow.mood_name,
    };
  }

  const recommendation = getRecommendation(row.mood_key);
  const feelings = MOOD_FEELINGS[row.mood_key] ?? [];
  let moodResult: MoodResultView | null = null;

  if (sessionId !== DEMO_SESSION_ID) {
    const sb = getSupabaseAdmin();
    const query = sb
      .from("mood_results")
      .select("id, ai_reasoning, recommendation_source, recommendation_id, recommendation_payload")
      .eq("profile_id", profileId)
      .eq("quiz_session_id", row.id)
      .order("created_at", { ascending: false })
      .limit(1);
    if (qs.moodResultId) query.eq("id", qs.moodResultId);
    const { data } = await query.maybeSingle();
    moodResult = (data as MoodResultView | null) ?? null;
  }

  const resolvedCocktailName = moodResult?.recommendation_payload?.cocktailName ?? recommendation.cocktailName;
  const resolvedFoodPairings = moodResult?.recommendation_payload?.foodPairings ?? [recommendation.foodName];
  const resolvedImage = moodResult?.recommendation_payload?.imageUrl ?? recommendation.cocktailImage;
  const resolvedFlavor = moodResult?.recommendation_payload?.flavorNotes ?? "Balanced emotional flavor profile";
  const resolvedDescription = moodResult?.recommendation_payload?.description ?? recommendation.pairingLine;
  const resolvedTasteLane = moodResult?.recommendation_payload?.tasteLane ?? null;
  const checkoutUrl = moodResult?.recommendation_payload?.squareCheckoutUrl ?? null;
  const reason = moodResult?.ai_reasoning ?? `Your emotional signature aligns with ${row.mood_name} tonight.`;
  const secondary = (moodResult?.recommendation_payload?.secondary ?? []).slice(0, 3);

  return (
    <main className="mx-auto min-h-[100dvh] max-w-6xl px-5 pb-28 pt-10 sm:px-8 sm:pt-14 lg:max-w-[72rem]">
      <Link
        href="/quiz"
        className="mb-8 inline-flex text-sm font-medium text-white/55 transition hover:text-white"
      >
        ← Retake pairing
      </Link>

      <article className="overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(170deg,#0d0b14_14%,#171123_52%,#120f1b_100%)] shadow-2xl shadow-black/60">
        {/* 1 — Mood read (story first) */}
        <div className="border-b border-white/[0.08] px-6 py-10 sm:px-10 sm:py-12">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--hs-accent)]">Mood reveal</p>
          <h1 className="mt-4 max-w-4xl font-[family-name:var(--font-serif)] text-[clamp(1.85rem,4.8vw,3rem)] font-semibold leading-[1.12] tracking-tight text-white">
            You&apos;re in your {row.mood_name} era.
          </h1>

          {feelings.length > 0 ? (
            <div className="mt-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">Emotional layers</p>
              <ul className="mt-3 flex flex-wrap gap-2" aria-label="Emotional layers">
                {feelings.map((f) => (
                  <li
                    key={f}
                    className="rounded-full border border-white/18 bg-white/[0.06] px-4 py-1.5 text-sm font-medium text-white/90"
                  >
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-8 max-w-3xl border-l-2 border-[var(--hs-accent)]/50 pl-5 sm:pl-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">Why this mood fits</p>
            <p className="mt-2 text-[15px] leading-relaxed text-white/82">{reason}</p>
          </div>
        </div>

        {/* 2 — Pairing (hero + details, logical read order) */}
        <div className="px-6 py-10 sm:px-10 sm:py-12">
          <header className="mb-8 max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/50">Tonight&apos;s pairing</p>
            <p className="mt-2 text-sm text-white/60">
              A single serve chosen for your mood profile{resolvedTasteLane ? " and taste lane" : ""}.
            </p>
          </header>

          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
            {/* DOM: story first on mobile; on lg image is column 1, copy column 2 */}
            <div className="flex flex-col gap-6 lg:col-start-2 lg:row-start-1">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--hs-accent)]/90">Signature serve</p>
                <h2 className="mt-2 font-[family-name:var(--font-serif)] text-[clamp(1.65rem,3.5vw,2.35rem)] font-semibold text-white">
                  {resolvedCocktailName}
                </h2>
                <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/72">{resolvedDescription}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-xl border border-white/14 bg-white/[0.05] px-3.5 py-2 text-xs text-white/78">
                  <span className="font-medium text-white/90">Flavor notes · </span>
                  {resolvedFlavor}
                </span>
                {resolvedTasteLane ? (
                  <span className="rounded-xl border border-white/14 bg-white/[0.05] px-3.5 py-2 text-xs text-white/78">
                    <span className="font-medium text-white/90">Taste lane · </span>
                    {tasteLaneLabel(resolvedTasteLane)}
                  </span>
                ) : null}
              </div>

              <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">Best enjoyed with</p>
                <ul className="mt-3 space-y-2 text-[15px] text-white/88">
                  {resolvedFoodPairings.map((food) => (
                    <li key={food} className="flex gap-2">
                      <span className="text-[var(--hs-accent)]" aria-hidden>
                        ·
                      </span>
                      <span>{food}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-1">
                <PurchaseCta
                  moodResultId={moodResult?.id}
                  recommendationId={moodResult?.recommendation_id ?? null}
                  checkoutUrl={checkoutUrl}
                />
              </div>
            </div>

            <figure className="overflow-hidden rounded-3xl border border-white/15 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] lg:col-start-1 lg:row-start-1">
              <div className="relative aspect-[4/3] w-full sm:aspect-[16/11]">
                <Image
                  src={resolvedImage}
                  alt={resolvedCocktailName}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              </div>
              <figcaption className="sr-only">Visual for {resolvedCocktailName}</figcaption>
            </figure>
          </div>
        </div>

        {/* 3 — Alternates + feedback + meta */}
        <footer className="border-t border-white/[0.08] px-6 py-8 sm:px-10 sm:py-10">
          {secondary.length > 0 ? (
            <div className="mb-10">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/50">You may also like</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {secondary.map((item) => (
                  <div
                    key={item.cocktailName}
                    className="rounded-2xl border border-white/12 bg-white/[0.04] p-4 transition hover:border-white/18"
                  >
                    <p className="font-semibold text-white">{item.cocktailName}</p>
                    <p className="mt-1 text-xs text-white/55">{item.flavorNotes}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {moodResult?.id ? (
            <div className="mb-8 max-w-2xl">
              <ResultFeedbackChips moodResultId={moodResult.id} />
            </div>
          ) : null}

          <p className="text-[11px] text-white/38">
            Source · {moodResult?.recommendation_source ?? "internal"}
            <span className="mx-2 text-white/25">·</span>
            Session {sessionId}
          </p>
        </footer>
      </article>
    </main>
  );
}
