import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DEMO_SESSION_ID } from "@/lib/session/constants";
import { getDemoResultPayload } from "@/lib/session/demo";
import { getQuizSessionForProfile } from "@/lib/data/quiz-session";
import { MOOD_FEELINGS } from "@/lib/catalog/moods";
import { getRecommendation } from "@/lib/catalog/recommendations";
import { buildCheckoutUrl } from "@/lib/checkout/build-checkout-url";
import { getCurrentProfileId } from "@/lib/auth/current-profile";
import { getPublicSiteUrl } from "@/lib/env";
import { ResultActions } from "@/components/result/ResultActions";

export const dynamic = "force-dynamic";

export default async function ResultPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
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
  const checkoutUrl = buildCheckoutUrl({
    moodKey: row.mood_key,
    sessionId: sessionId === DEMO_SESSION_ID ? DEMO_SESSION_ID : row.id,
    profileId,
    productSlug: row.mood_key,
  });
  const shareUrl = `${getPublicSiteUrl().replace(/\/$/, "")}/result/${sessionId}`;

  return (
    <main className="mx-auto min-h-[100dvh] max-w-xl px-5 pb-24 pt-12 sm:pt-16">
      <Link href="/quiz" className="mb-8 inline-block text-sm text-white/60 hover:text-white">
        Retake pairing
      </Link>

      <div className="overflow-hidden rounded-[2rem] bg-[var(--hs-panel)] p-6 shadow-2xl shadow-black/40 sm:p-9">
        <p className="font-[family-name:var(--font-serif)] text-3xl font-semibold tracking-tight text-[#2563eb] sm:text-4xl">
          We Think You&apos;ll Love
        </p>
        <p className="mt-2 text-sm text-[var(--hs-muted)]">Mood fidelity score: {row.confidence_score} / 5</p>

        <div className="mt-8 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--hs-ink)]">{row.mood_name}</h1>
          <p className="text-[var(--hs-muted)]">Feelings layered in</p>
          <div className="flex flex-wrap gap-2 pt-2">
            {feelings.map((f) => (
              <span
                key={f}
                className="rounded-full border border-black/10 bg-white px-4 py-1.5 text-sm font-medium text-[var(--hs-ink)]"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        <p className="mt-10 font-[family-name:var(--font-serif)] text-lg text-[var(--hs-ink)]">
          <span className="text-[var(--hs-muted)]">Your pairing • </span>
          {recommendation.pairingLine}
        </p>

        <div className="mt-8 grid gap-6">
          <PairBlock
            eyebrow="Cocktail"
            title={recommendation.cocktailName}
            image={recommendation.cocktailImage}
            accent="purple"
            imagePriority
          />
          <PairBlock
            eyebrow="Food pairing"
            title={recommendation.foodName}
            image={recommendation.foodImage}
            accent="orange"
          />
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-black/10 pt-10">
          <ResultActions
            checkoutUrl={checkoutUrl}
            recommendation={recommendation}
            moodName={row.mood_name}
            feelings={feelings}
            sessionId={sessionId}
            shareUrl={shareUrl}
          />
        </div>
      </div>
    </main>
  );
}

function PairBlock({
  eyebrow,
  title,
  image,
  accent,
  imagePriority = false,
}: {
  eyebrow: string;
  title: string;
  image: string;
  accent: "purple" | "orange";
  imagePriority?: boolean;
}) {
  const ring = accent === "purple" ? "ring-purple-600/35" : "ring-orange-500/35";
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--hs-muted)]">{eyebrow}</p>
      <div className={`overflow-hidden rounded-3xl ring-4 ${ring} ring-offset-2 ring-offset-white`}>
        <div className="relative aspect-square w-full">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, 480px"
            className="object-cover"
            priority={imagePriority}
          />
        </div>
      </div>
      <p className="text-lg font-semibold uppercase tracking-wide text-[var(--hs-ink)]">{title}</p>
    </div>
  );
}
