import Link from "next/link";
import { requireAdminUser } from "@/lib/auth/admin";
import { getCatalogPolicyConfig } from "@/lib/admin/catalog-policy";
import { getQuizContentConfig } from "@/lib/quiz/quiz-content";
import { getAiAgentConfig, getOpenAiApiKey } from "@/lib/intelligence/ai-agent-config";
import { listMediaAssets } from "@/lib/admin/media-assets";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  listingMissingDrinkImage,
  listingMissingFoodImage,
  parseAdminTab,
  parseListingFilter,
  type CatalogListing,
} from "@/lib/admin/listing-filters";
import { AdminCatalogPolicyPanel } from "@/components/admin/AdminCatalogPolicyPanel";
import { AdminQuizContentPanel } from "@/components/admin/AdminQuizContentPanel";
import { AdminAiSettingsPanel } from "@/components/admin/AdminAiSettingsPanel";
import { AdminAddListingForm } from "@/components/admin/AdminAddListingForm";
import { AdminBulkImportPanel } from "@/components/admin/AdminBulkImportPanel";
import { AdminCatalogTable } from "@/components/admin/AdminCatalogTable";
import { AdminMediaTable, type MediaAssetRow } from "@/components/admin/AdminMediaTable";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { AdminTabNav } from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string; filter?: string; tab?: string }>;
}) {
  await requireAdminUser();
  const qs = await searchParams;
  const tab = parseAdminTab(qs.tab);
  const filter = parseListingFilter(qs.filter);
  const formSaved = qs.saved === "1";
  const formError = typeof qs.error === "string" && qs.error.trim() ? qs.error.trim() : null;

  const sb = getSupabaseAdmin();

  const [recsRes, moodRes, clicksRes, mediaAssets, aiConfig, catalogPolicy, quizContent] = await Promise.all([
    sb.from("cocktail_recommendations").select("*").order("priority_score", { ascending: false }),
    sb.from("mood_results").select("mood_key, confidence_score"),
    sb.from("recommendation_clicks").select("*", { count: "exact", head: true }),
    listMediaAssets(),
    getAiAgentConfig(),
    getCatalogPolicyConfig(),
    getQuizContentConfig(),
  ]);

  const allRecs = (recsRes.data ?? []) as CatalogListing[];
  const missingDrinkCount = allRecs.filter((rec) => listingMissingDrinkImage(rec.image_url)).length;
  const missingFoodCount = allRecs.filter((rec) =>
    listingMissingFoodImage(rec.food_name, rec.food_image_url),
  ).length;

  const activeTabMeta = {
    overview: "Summary",
    catalog: "Catalog",
    media: "Media library",
    import: "Bulk import",
    add: "Add listing",
    quiz: "Quiz content",
    ai: "AI agent",
    policies: "Policies",
  }[tab];

  return (
    <main className="min-h-[100dvh] bg-[linear-gradient(160deg,#09080f_15%,#151024_46%,#1c131a_74%,#0c0a13_100%)] px-[max(1rem,env(safe-area-inset-left))] py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pr-[max(1rem,env(safe-area-inset-right))] pt-[max(1.5rem,env(safe-area-inset-top)+0.5rem)] text-white sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/40">HiddenSense</p>
            <h1 className="mt-1 font-[family-name:var(--font-serif)] text-[clamp(1.5rem,4vw,2rem)] font-semibold tracking-tight">
              Admin · {activeTabMeta}
            </h1>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/[0.03] px-4 py-2 text-sm text-white/80 hover:bg-white/[0.07]"
          >
            Back to dashboard
          </Link>
        </header>

        <div className="mb-6">
          <AdminTabNav activeTab={tab} />
        </div>

        <div className="space-y-4">
          {tab === "overview" ? (
            <AdminOverview
              metrics={{
                moodResults: (moodRes.data ?? []).length,
                clicks: clicksRes.count ?? 0,
                totalListings: allRecs.length,
                missingDrink: missingDrinkCount,
                missingFood: missingFoodCount,
              }}
            />
          ) : null}

          {tab === "catalog" ? (
            <>
              {formSaved ? (
                <p className="rounded-lg border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                  Changes saved.
                </p>
              ) : null}
              <AdminCatalogTable listings={allRecs} initialFilter={filter} />
            </>
          ) : null}

          {tab === "media" ? (
            <AdminMediaTable assets={mediaAssets as MediaAssetRow[]} />
          ) : null}

          {tab === "import" ? <AdminBulkImportPanel /> : null}

          {tab === "add" ? <AdminAddListingForm saved={formSaved} error={formError} /> : null}

          {tab === "quiz" ? <AdminQuizContentPanel initial={quizContent} /> : null}

          {tab === "ai" ? (
            <AdminAiSettingsPanel initial={aiConfig} openAiConfigured={getOpenAiApiKey() !== null} />
          ) : null}

          {tab === "policies" ? <AdminCatalogPolicyPanel initial={catalogPolicy} /> : null}
        </div>
      </div>
    </main>
  );
}
