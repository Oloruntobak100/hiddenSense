"use client";

import { ResultHeroImage } from "@/components/result/ResultHeroImage";

type ResultFoodSectionProps = {
  foodImage: string | null;
  foodTitle: string;
  foodPairings: string[];
};

export function ResultFoodSection({ foodImage, foodTitle, foodPairings }: ResultFoodSectionProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/12 bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:rounded-3xl">
      {foodImage ? (
        <ResultHeroImage src={foodImage} alt={foodTitle} />
      ) : (
        <div className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 border-b border-white/[0.06] bg-white/[0.02] px-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">Food pairing</p>
          <p className="text-sm text-white/55">Image coming soon for this listing.</p>
        </div>
      )}
      <div className="p-5 sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">Food pairing</p>
        <h2 className="mt-2 font-[family-name:var(--font-serif)] text-xl font-semibold text-white sm:text-2xl">
          {foodTitle}
        </h2>
        {foodPairings.length > 1 ? (
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            {foodPairings.map((food) => (
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
  );
}
