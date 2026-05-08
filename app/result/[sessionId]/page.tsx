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
    confidence_score: number;
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
      confidence_score: demo.confidence_score,
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
      confidence_score: dbRow.confidence_score,
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

  return (
    <main className="mx-auto min-h-[100dvh] max-w-4xl px-5 pb-24 pt-12 sm:px-6 sm:pt-16">
      <Link href="/quiz" className="mb-8 inline-block text-sm text-white/60 hover:text-white">
        Retake pairing
      </Link>

      <div className="overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(170deg,#0d0b14_14%,#171123_52%,#120f1b_100%)] p-6 shadow-2xl shadow-black/60 sm:p-10">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--hs-accent)]">Mood reveal</p>
        <p className="mt-3 font-[family-name:var(--font-serif)] text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          You&apos;re in your {row.mood_name} era.
        </p>
        <p className="mt-3 text-sm text-white/65">Confidence signal: {row.confidence_score} / 5</p>

        <div className="mt-8 space-y-2">
          <p className="text-sm leading-relaxed text-white/80">{reason}</p>
          <p className="text-sm text-white/55">Emotional layers</p>
          <div className="flex flex-wrap gap-2 pt-2">
            {feelings.map((f) => (
              <span
                key={f}
                className="rounded-full border border-white/20 bg-white/[0.06] px-4 py-1.5 text-sm font-medium text-white/90"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.16em] text-white/55">The perfect pairing tonight</p>
            <div className="overflow-hidden rounded-3xl border border-white/15 bg-white/[0.04]">
              <div className="relative aspect-[4/3] w-full">
                <Image src={resolvedImage} alt={resolvedCocktailName} fill sizes="(max-width: 768px) 100vw, 55vw" className="object-cover" />
              </div>
            </div>
            <h2 className="font-[family-name:var(--font-serif)] text-3xl text-white">{resolvedCocktailName}</h2>
            <p className="text-sm text-white/70">{resolvedDescription}</p>
            <p className="text-sm text-white/60">
              <span className="text-white/80">Flavor notes:</span> {resolvedFlavor}
            </p>
            {resolvedTasteLane ? (
              <p className="text-sm text-white/60">
                <span className="text-white/80">Taste lane:</span> {resolvedTasteLane}
              </p>
            ) : null}
          </div>

          <div className="space-y-5 rounded-3xl border border-white/15 bg-white/[0.04] p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-white/55">Best enjoyed with</p>
              <ul className="mt-2 space-y-1 text-white/88">
                {resolvedFoodPairings.map((food) => (
                  <li key={food}>• {food}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-white/55">Why this matches you</p>
              <p className="mt-2 text-sm leading-relaxed text-white/75">{reason}</p>
            </div>

            <PurchaseCta
              moodResultId={moodResult?.id}
              recommendationId={moodResult?.recommendation_id ?? null}
              checkoutUrl={checkoutUrl}
            />
          </div>
        </div>

        <div className="mt-10 space-y-4 border-t border-white/15 pt-8">
          <p className="text-xs uppercase tracking-[0.16em] text-white/55">You may also like</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {(moodResult?.recommendation_payload?.secondary ?? [])
              .slice(0, 3)
              .map((secondary) => (
                <div key={secondary.cocktailName} className="rounded-2xl border border-white/12 bg-white/[0.04] p-4">
                  <p className="font-semibold text-white">{secondary.cocktailName}</p>
                  <p className="mt-1 text-xs text-white/60">{secondary.flavorNotes}</p>
                </div>
              ))}
          </div>
          {moodResult?.id ? <ResultFeedbackChips moodResultId={moodResult.id} /> : null}
          <p className="text-xs text-white/45">
            Source: {moodResult?.recommendation_source ?? "internal"} · Session {sessionId}
          </p>
        </div>
      </div>
    </main>
  );
}
