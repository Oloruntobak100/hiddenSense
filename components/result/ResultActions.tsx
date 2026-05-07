"use client";

import Link from "next/link";
import { useState } from "react";
import type { Recommendation } from "@/lib/catalog/recommendations";

const btnPrimary =
  "inline-flex flex-1 items-center justify-center gap-2 rounded-2xl px-6 py-4 text-center text-base font-semibold text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:active:scale-[0.98] sm:min-w-[200px]";
const btnGhost =
  "inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-black/15 bg-white/80 px-6 py-3.5 text-center text-base font-semibold text-[var(--hs-ink)] transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-black/30 sm:min-w-[160px]";

type Props = {
  checkoutUrl: string;
  recommendation: Recommendation;
  moodName: string;
  feelings: string[];
  sessionId: string;
  shareUrl: string;
};

export function ResultActions({
  checkoutUrl,
  recommendation,
  moodName,
  feelings,
  sessionId,
  shareUrl,
}: Props) {
  const [recipeOpen, setRecipeOpen] = useState(false);

  async function handleShare() {
    const moodLine = `${moodName}: ${feelings.slice(0, 3).join(", ")}`;
    const text = `${moodLine}\nHiddenSense™ pairing: ${recommendation.cocktailName} + ${recommendation.foodName}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "HiddenSense™", text, url: shareUrl });
        return;
      }
    } catch {
      return;
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${shareUrl}`);
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <a
          href={checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btnPrimary} bg-[var(--hs-accent-strong)]`}
        >
          Buy This Cocktail
          <span aria-hidden>→</span>
        </a>
        <button type="button" className={btnGhost} onClick={() => setRecipeOpen(true)}>
          Get Recipe
        </button>
        <button type="button" className={btnGhost} onClick={() => void handleShare()}>
          Share My Mood
        </button>
      </div>

      <PrimaryCtaFeedback sessionId={sessionId} />

      {recipeOpen ? (
        <RecipeModal
          title={recommendation.recipe.title}
          ingredients={recommendation.recipe.ingredients}
          steps={recommendation.recipe.steps}
          onClose={() => setRecipeOpen(false)}
        />
      ) : null}
    </>
  );
}

function PrimaryCtaFeedback({ sessionId }: { sessionId: string }) {
  return (
    <Link
      href={`/feedback/${sessionId}`}
      className="inline-flex items-center justify-center rounded-2xl border border-transparent bg-black px-8 py-4 text-center text-base font-semibold text-white underline-offset-4 hover:underline"
    >
      Rate this recommendation (next step)
    </Link>
  );
}

function RecipeModal({
  title,
  ingredients,
  steps,
  onClose,
}: {
  title: string;
  ingredients: string[];
  steps: string[];
  onClose: () => void;
}) {
  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="recipe-title"
        className="max-h-[85vh] w-full max-w-md overflow-auto rounded-t-3xl bg-white p-6 shadow-xl sm:rounded-3xl"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="recipe-title" className="font-[family-name:var(--font-serif)] text-2xl text-[var(--hs-ink)]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-black/5 px-3 py-1 text-sm font-medium text-black/70"
          >
            Close
          </button>
        </div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-[var(--hs-muted)]">Ingredients</h3>
        <ul className="mb-6 list-disc space-y-2 pl-5 text-[var(--hs-ink)]">
          {ingredients.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-[var(--hs-muted)]">Steps</h3>
        <ol className="list-decimal space-y-2 pl-5 text-[var(--hs-ink)]">
          {steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
