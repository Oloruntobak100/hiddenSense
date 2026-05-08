import Link from "next/link";
import type { InputHTMLAttributes } from "react";
import { createRecommendation, deleteRecommendation, toggleRecommendationActive } from "@/app/actions/admin";
import { requireAdminUser } from "@/lib/auth/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdminUser();
  const sb = getSupabaseAdmin();

  const [{ data: recs }, { data: moodStats }, { data: feedbackStats }, { count: clicksCount }] = await Promise.all([
    sb.from("cocktail_recommendations").select("*").order("priority_score", { ascending: false }),
    sb.from("mood_results").select("mood_key, confidence_score"),
    sb.from("feedback_responses").select("response"),
    sb.from("recommendation_clicks").select("*", { count: "exact", head: true }),
  ]);

  return (
    <main className="min-h-[100dvh] bg-[linear-gradient(160deg,#09080f_15%,#151024_46%,#1c131a_74%,#0c0a13_100%)] px-5 py-10 text-white sm:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="font-[family-name:var(--font-serif)] text-4xl font-semibold tracking-tight">HiddenSense Admin</h1>
          <Link href="/intro" className="rounded-xl border border-white/20 bg-white/[0.04] px-4 py-2 text-sm hover:bg-white/[0.1]">
            Back to Intro
          </Link>
        </div>

        <section className="mb-8 grid gap-4 md:grid-cols-4">
          <MetricCard title="Mood Results" value={String(moodStats?.length ?? 0)} />
          <MetricCard title="Recommendation Clicks" value={String(clicksCount ?? 0)} />
          <MetricCard
            title="Feedback Accuracy"
            value={`${Math.round(((feedbackStats?.filter((r) => r.response === "absolutely").length ?? 0) / Math.max(1, feedbackStats?.length ?? 0)) * 100)}%`}
          />
          <MetricCard
            title="Avg Confidence"
            value={`${Math.round((moodStats?.reduce((a, r) => a + Number(r.confidence_score), 0) ?? 0) / Math.max(1, moodStats?.length ?? 0))}%`}
          />
        </section>

        <section className="grid gap-8 lg:grid-cols-[1fr_1.35fr]">
          <div className="rounded-3xl border border-white/12 bg-white/[0.03] p-6 shadow-xl shadow-black/30">
            <h2 className="mb-4 text-lg font-semibold">Add Recommendation</h2>
            <form action={createRecommendation} className="grid gap-3">
              <AdminInput name="cocktail_name" placeholder="Cocktail name" required />
              <AdminInput name="alcohol_category" placeholder="Alcohol category" required />
              <AdminInput name="mood_tags" placeholder="Mood tags (comma separated keys)" required />
              <AdminInput name="flavor_profile" placeholder="Flavor profile" required />
              <AdminInput name="emotional_tags" placeholder="Emotional tags (comma separated)" />
              <AdminInput name="atmosphere_tags" placeholder="Atmosphere tags (comma separated)" />
              <AdminInput name="square_checkout_url" placeholder="Square checkout URL" />
              <AdminInput name="image_url" placeholder="Image URL" />
              <AdminInput name="food_pairings" placeholder="Food pairings (comma separated)" />
              <AdminInput name="priority_score" type="number" placeholder="Priority 0-100" />
              <textarea
                name="description"
                placeholder="Description"
                required
                className="h-24 rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm outline-none placeholder:text-white/35"
              />
              <label className="inline-flex items-center gap-2 text-sm text-white/70">
                <input type="checkbox" name="active" defaultChecked className="accent-[var(--hs-accent)]" />
                Active recommendation
              </label>
              <button className="mt-2 rounded-xl bg-[var(--hs-accent)] px-4 py-2.5 font-semibold hover:brightness-110">
                Save Recommendation
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-white/12 bg-white/[0.03] p-6 shadow-xl shadow-black/30">
            <h2 className="mb-4 text-lg font-semibold">Recommendation Library</h2>
            <div className="space-y-3">
              {(recs ?? []).map((rec) => (
                <div key={rec.id} className="rounded-2xl border border-white/12 bg-black/20 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{rec.cocktail_name}</p>
                      <p className="text-sm text-white/60">
                        {rec.alcohol_category} • {rec.flavor_profile}
                      </p>
                      <p className="mt-1 text-xs text-white/45">Mood tags: {rec.mood_tags.join(", ")}</p>
                    </div>
                    <div className="flex gap-2">
                      <form action={async () => { "use server"; await toggleRecommendationActive(rec.id, !rec.active); }}>
                        <button
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${rec.active ? "bg-emerald-500/20 text-emerald-200" : "bg-white/10 text-white/70"}`}
                        >
                          {rec.active ? "Active" : "Inactive"}
                        </button>
                      </form>
                      <form action={async () => { "use server"; await deleteRecommendation(rec.id); }}>
                        <button className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-200">
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-[0.15em] text-white/55">{title}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function AdminInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm outline-none placeholder:text-white/35"
    />
  );
}
