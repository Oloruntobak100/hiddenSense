import Link from "next/link";
import { createRecommendation, deleteRecommendation, toggleRecommendationActive } from "@/app/actions/admin";
import { ALCOHOL_CATEGORIES } from "@/lib/admin/alcohol-categories";
import { requireAdminUser } from "@/lib/auth/admin";
import { MOOD_ARCHETYPES } from "@/lib/intelligence/mood-archetypes";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const ALL_MOOD_KEY_SET = new Set(MOOD_ARCHETYPES.map((m) => m.key));

function isUniversalMoodTags(tags: string[]) {
  const unique = new Set(tags);
  if (unique.size !== ALL_MOOD_KEY_SET.size) return false;
  for (const k of ALL_MOOD_KEY_SET) {
    if (!unique.has(k)) return false;
  }
  return true;
}

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
    <main className="min-h-[100dvh] bg-[linear-gradient(160deg,#09080f_15%,#151024_46%,#1c131a_74%,#0c0a13_100%)] px-[max(1.25rem,env(safe-area-inset-left))] py-8 pb-[max(2rem,env(safe-area-inset-bottom))] pr-[max(1.25rem,env(safe-area-inset-right))] pt-[max(2rem,env(safe-area-inset-top)+0.75rem)] text-white sm:px-8 sm:py-10">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="font-[family-name:var(--font-serif)] text-[clamp(1.65rem,5vw,2.25rem)] font-semibold leading-tight tracking-tight">
            HiddenSense Admin
          </h1>
          <Link
            href="/intro"
            className="inline-flex min-h-11 shrink-0 items-center justify-center self-start rounded-xl border border-white/20 bg-white/[0.04] px-4 py-2.5 text-sm hover:bg-white/[0.1] sm:self-auto"
          >
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

        <section className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_1fr]">
          <div className="h-fit rounded-3xl border border-white/12 bg-white/[0.03] p-6 shadow-xl shadow-black/30">
            <h2 className="mb-2 text-lg font-semibold">Add checkout listing</h2>
            <p className="mb-6 text-xs leading-relaxed text-white/48">
              Drink name, spirit category, Square checkout link, drink hero image, optional food name and food image
              (JPEG / PNG / WebP / GIF, max 5 MB each). Listings apply across all moods; priority is boosted when matched.
            </p>
            <form action={createRecommendation} encType="multipart/form-data" className="grid gap-4">
              <label className="grid gap-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">Drink name</span>
                <input
                  name="cocktail_name"
                  required
                  placeholder="Hidden Spirits Evening Spritz"
                  className="rounded-xl border border-white/15 bg-black/20 px-3 py-2.5 text-sm outline-none placeholder:text-white/35"
                />
              </label>

              <label className="grid gap-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">Category</span>
                <select
                  name="alcohol_category"
                  required
                  className="appearance-none rounded-xl border border-white/15 bg-black/20 bg-[length:14px_10px] bg-[right_0.75rem_center] bg-no-repeat px-3 py-2.5 text-sm outline-none [&>option]:bg-[#151024]"
                  style={{
                    backgroundImage:
                      'url(\'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"%3E%3Cpath stroke="%23ffffff" stroke-opacity=".45" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m6 8 4 4 4-4"/%3E%3C/svg%3E\')',
                    paddingRight: "2.25rem",
                  }}
                >
                  {ALCOHOL_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">Square checkout URL</span>
                <input
                  name="square_checkout_url"
                  type="url"
                  required
                  placeholder="https://..."
                  className="rounded-xl border border-white/15 bg-black/20 px-3 py-2.5 text-sm outline-none placeholder:text-white/35"
                />
              </label>

              <label className="grid gap-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">Drink image</span>
                <input
                  type="file"
                  name="image_file"
                  required
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="text-sm text-white/80 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-sm file:text-white file:hover:bg-white/15"
                />
              </label>

              <label className="grid gap-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">Food suggestion (optional)</span>
                <input
                  name="food_name"
                  placeholder="Citrus tuna crudo"
                  className="rounded-xl border border-white/15 bg-black/20 px-3 py-2.5 text-sm outline-none placeholder:text-white/35"
                />
              </label>

              <label className="grid gap-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">Food image (optional)</span>
                <input
                  type="file"
                  name="food_image_file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="text-sm text-white/80 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-sm file:text-white file:hover:bg-white/15"
                />
              </label>

              <button type="submit" className="mt-2 rounded-xl bg-[var(--hs-accent)] px-4 py-2.5 text-sm font-semibold hover:brightness-110">
                Save listing
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-white/12 bg-white/[0.03] p-6 shadow-xl shadow-black/30">
            <h2 className="mb-4 text-lg font-semibold">Checkout library</h2>
            <div className="space-y-3">
              {(recs ?? []).map((rec) => (
                <div key={rec.id} className="rounded-2xl border border-white/12 bg-black/20 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="mt-1 flex shrink-0 gap-2">
                      {rec.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={rec.image_url}
                          alt=""
                          className="h-16 w-16 rounded-xl border border-white/15 object-cover"
                          width={64}
                          height={64}
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/[0.03] text-[10px] text-white/40">
                          No drink
                        </div>
                      )}
                      {rec.food_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={rec.food_image_url}
                          alt=""
                          className="h-16 w-16 rounded-xl border border-white/15 object-cover"
                          width={64}
                          height={64}
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{rec.cocktail_name}</p>
                      <p className="text-sm text-white/65">{rec.alcohol_category}</p>
                      {rec.food_name ? (
                        <p className="mt-1 text-xs text-white/55">Food · {rec.food_name}</p>
                      ) : null}
                      {isUniversalMoodTags(rec.mood_tags) ? (
                        <p className="mt-1 text-xs text-white/45">Eligible for · all moods</p>
                      ) : rec.mood_tags.length > 0 ? (
                        <p className="mt-1 text-xs text-white/45">Mood tags · {rec.mood_tags.join(", ")}</p>
                      ) : null}
                      {rec.square_checkout_url && rec.square_checkout_url !== "https://example.com/checkout" ? (
                        <p className="mt-1 truncate text-xs text-[var(--hs-accent)]" title={rec.square_checkout_url}>
                          Square linked
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <form action={async () => { "use server"; await toggleRecommendationActive(rec.id, !rec.active); }}>
                        <button
                          type="submit"
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${rec.active ? "bg-emerald-500/20 text-emerald-200" : "bg-white/10 text-white/70"}`}
                        >
                          {rec.active ? "Active" : "Inactive"}
                        </button>
                      </form>
                      <form action={async () => { "use server"; await deleteRecommendation(rec.id); }}>
                        <button type="submit" className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-200">
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
