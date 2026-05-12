import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { DEMO_SESSION_ID } from "@/lib/session/constants";
import { getDemoResultPayload } from "@/lib/session/demo";
import { getQuizSessionForProfile } from "@/lib/data/quiz-session";
import { MOOD_FEELINGS } from "@/lib/catalog/moods";
import { getRecommendation } from "@/lib/catalog/recommendations";
import { getAuthUserId, getCurrentProfileId } from "@/lib/auth/current-profile";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { upsertProfileFromAuthUser } from "@/lib/profile/sync-from-user";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { PurchaseCta } from "@/components/result/PurchaseCta";
import { BackNavButton } from "@/components/navigation/BackNavButton";

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
    foodName?: string | null;
    foodImageUrl?: string | null;
    description?: string;
    alcoholCategory?: string;
    imageUrl?: string | null;
    squareCheckoutUrl?: string | null;
    square_checkout_url?: string | null;
    tasteLane?: "lemon" | "strawberry" | "apple";
    secondary?: Array<{ cocktailName: string; flavorNotes: string }>;
  };
};

const PLACEHOLDER_SQUARE_CHECKOUT = "https://example.com/checkout";

function coerceSquareCheckoutUrl(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed === PLACEHOLDER_SQUARE_CHECKOUT) return null;
  try {
    const u = new URL(trimmed);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return trimmed;
  } catch {
    return null;
  }
}

async function resolveSquareCheckoutUrl(
  sb: ReturnType<typeof getSupabaseAdmin>,
  moodResult: MoodResultView | null,
): Promise<string | null> {
  if (!moodResult) return null;
  const p = moodResult.recommendation_payload;
  let url =
    coerceSquareCheckoutUrl(p.squareCheckoutUrl) ??
    coerceSquareCheckoutUrl(p.square_checkout_url);

  if (!url && moodResult.recommendation_id) {
    const { data } = await sb
      .from("cocktail_recommendations")
      .select("square_checkout_url")
      .eq("id", moodResult.recommendation_id)
      .maybeSingle();
    url = coerceSquareCheckoutUrl(data?.square_checkout_url ?? null);
  }
  return url;
}

function tasteLaneLabel(lane: "lemon" | "strawberry" | "apple") {
  return lane.charAt(0).toUpperCase() + lane.slice(1);
}

function parseIsMinor(attributeProfile: unknown): boolean {
  if (!attributeProfile || typeof attributeProfile !== "object" || Array.isArray(attributeProfile)) return false;
  return (attributeProfile as Record<string, unknown>).alcohol_policy === "minor";
}

export default async function ResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ moodResultId?: string }>;
}) {
  const [{ sessionId }, qs] = await Promise.all([params, searchParams]);

  const returnQuery = new URLSearchParams();
  if (typeof qs.moodResultId === "string" && qs.moodResultId.trim()) {
    returnQuery.set("moodResultId", qs.moodResultId.trim());
  }
  const resultPath = `/result/${sessionId}${returnQuery.toString() ? `?${returnQuery}` : ""}`;

  type RowLite = {
    id: string;
    mood_key: string;
    mood_name: string;
  };

  let row: RowLite;
  let isMinor = false;
  let profileId: string | null = null;

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
    profileId = await getCurrentProfileId();
    if (!profileId) {
      const userId = await getAuthUserId();
      if (!userId) {
        redirect(`/gate?next=${encodeURIComponent(resultPath)}`);
      }
      const supabase = await createServerSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await upsertProfileFromAuthUser(user);
      }
      profileId = await getCurrentProfileId();
      if (!profileId) {
        redirect("/dashboard");
      }
    }

    const dbRow = await getQuizSessionForProfile(sessionId);
    if (!dbRow) {
      notFound();
    }
    isMinor = parseIsMinor(dbRow.attribute_profile);
    row = {
      id: dbRow.id,
      mood_key: dbRow.mood_key,
      mood_name: dbRow.mood_name,
    };
  }

  const recommendation = getRecommendation(row.mood_key);
  const feelings = MOOD_FEELINGS[row.mood_key] ?? [];
  let moodResult: MoodResultView | null = null;
  let squareCheckoutUrl: string | null = null;

  if (sessionId !== DEMO_SESSION_ID) {
    if (!profileId) {
      notFound();
    }
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
    squareCheckoutUrl = await resolveSquareCheckoutUrl(sb, moodResult);
  }

  const p = moodResult?.recommendation_payload;
  const resolvedCocktailName = p?.cocktailName ?? recommendation.cocktailName;
  const payloadPairings = p?.foodPairings;
  const resolvedFoodPairings =
    Array.isArray(payloadPairings) && payloadPairings.some((x) => typeof x === "string" && x.trim())
      ? payloadPairings.filter((x): x is string => typeof x === "string" && Boolean(x.trim()))
      : [recommendation.foodName];
  const resolvedDrinkImage = p?.imageUrl ?? recommendation.cocktailImage;
  const resolvedFoodTitle =
    (typeof p?.foodName === "string" && p.foodName.trim()) ? p.foodName.trim() : resolvedFoodPairings[0] ?? recommendation.foodName;
  const resolvedFoodImage =
    (typeof p?.foodImageUrl === "string" && p.foodImageUrl.trim()) ? p.foodImageUrl.trim() : recommendation.foodImage;
  const resolvedFlavor = p?.flavorNotes ?? "Balanced emotional flavor profile";
  const resolvedDescription = p?.description ?? recommendation.pairingLine;
  const resolvedTasteLane = p?.tasteLane ?? null;
  const reason = moodResult?.ai_reasoning ?? `Your emotional signature aligns with ${row.mood_name} tonight.`;
  const secondary = (p?.secondary ?? []).slice(0, 3);

  const backFallback = (await getAuthUserId()) ? "/dashboard" : "/";

  return (
    <main className="mx-auto min-h-[100dvh] max-w-6xl pb-[max(7rem,env(safe-area-inset-bottom)+4rem)] pl-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] pt-[max(2.5rem,env(safe-area-inset-top)+1.5rem)] sm:pb-28 sm:pl-8 sm:pr-8 sm:pt-14 lg:max-w-[72rem]">
      <div className="mb-6 flex flex-wrap items-center gap-3 sm:mb-8">
        <Suspense fallback={<div className="h-11 w-24 shrink-0 rounded-full bg-white/10" aria-hidden />}>
          <BackNavButton fallbackHref={backFallback} />
        </Suspense>
        <Link
          href="/quiz"
          className="inline-flex min-h-11 items-center text-sm font-medium text-white/55 transition active:text-white hover:text-white"
        >
          ← Retake pairing
        </Link>
      </div>

      <article className="overflow-hidden rounded-2xl border border-white/12 bg-[linear-gradient(170deg,#0d0b14_14%,#171123_52%,#120f1b_100%)] shadow-2xl shadow-black/60 sm:rounded-[2rem]">
        <div className="border-b border-white/[0.08] px-5 py-8 sm:px-10 sm:py-12">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--hs-accent)]">Mood reveal</p>
          <h1 className="mt-4 max-w-4xl font-[family-name:var(--font-serif)] text-[clamp(1.55rem,5.2vw,3rem)] font-semibold leading-[1.14] tracking-tight text-white sm:leading-[1.12]">
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

        <div className="px-5 py-8 sm:px-10 sm:py-12">
          <header className="mb-8 max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/50">Tonight&apos;s pairing</p>
            <p className="mt-2 text-sm text-white/60">
              {isMinor
                ? "Food-forward inspiration with alcohol-free serves matched to your mood."
                : `Curated drink and plate for your mood profile${resolvedTasteLane ? " and taste lane" : ""}.`}
            </p>
          </header>

          <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
            <section className="overflow-hidden rounded-2xl border border-white/12 bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:rounded-3xl">
              <div className="relative aspect-[16/10] w-full">
                <Image
                  src={resolvedDrinkImage}
                  alt={resolvedCocktailName}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="space-y-4 p-5 sm:p-6">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--hs-accent)]/90">
                    {isMinor ? "Zero-proof serve" : "Signature serve"}
                  </p>
                  <h2 className="mt-2 font-[family-name:var(--font-serif)] text-xl font-semibold leading-snug text-white sm:text-2xl">
                    {resolvedCocktailName}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/72">{resolvedDescription}</p>
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
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-white/12 bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:rounded-3xl">
              <div className="relative aspect-[16/10] w-full">
                <Image
                  src={resolvedFoodImage}
                  alt={resolvedFoodTitle}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="p-5 sm:p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">Food pairing</p>
                <h2 className="mt-2 font-[family-name:var(--font-serif)] text-xl font-semibold text-white sm:text-2xl">
                  {resolvedFoodTitle}
                </h2>
                {resolvedFoodPairings.length > 1 ? (
                  <ul className="mt-4 space-y-2 text-sm text-white/80">
                    {resolvedFoodPairings.map((food) => (
                      <li key={food} className="flex gap-2">
                        <span className="text-[var(--hs-accent)]" aria-hidden>
                          ·
                        </span>
                        <span>{food}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-white/70">Crafted to complement your mood and the serve above.</p>
                )}
              </div>
            </section>
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            <PurchaseCta
              moodResultId={moodResult?.id}
              recommendationId={moodResult?.recommendation_id ?? null}
              squareCheckoutUrl={squareCheckoutUrl}
              isMinor={isMinor}
            />
            {moodResult?.id ? (
              <Link
                href={`/feedback/${sessionId}/mood?moodResultId=${encodeURIComponent(moodResult.id)}&returnTo=${encodeURIComponent(resultPath)}`}
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/22 bg-white/[0.06] px-6 py-3 text-center text-sm font-semibold text-white/90 transition hover:border-white/35 hover:bg-white/[0.1] sm:min-w-[220px]"
              >
                Rate how we read your mood
              </Link>
            ) : null}
          </div>
        </div>

        <footer className="border-t border-white/[0.08] px-5 py-7 sm:px-10 sm:py-10">
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
