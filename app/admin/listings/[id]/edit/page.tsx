import Link from "next/link";
import { AdminEditListingForm } from "@/components/admin/AdminEditListingForm";
import { requireAdminUser } from "@/lib/auth/admin";
import { getListingById } from "@/lib/admin/update-listing";

export const dynamic = "force-dynamic";

export default async function EditListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdminUser();
  const { id } = await params;
  const qs = await searchParams;
  const listing = await getListingById(id);

  if (!listing) {
    return (
      <main className="min-h-[100dvh] bg-[#09080f] px-6 py-10 text-white">
        <p>Listing not found.</p>
        <Link
          href="/admin?tab=catalog"
          className="mt-4 inline-block text-[var(--hs-accent)] underline-offset-2 hover:underline"
        >
          Back to catalog
        </Link>
      </main>
    );
  }

  const formError = typeof qs.error === "string" && qs.error.trim() ? qs.error.trim() : null;

  return (
    <main className="min-h-[100dvh] bg-[linear-gradient(160deg,#09080f_15%,#151024_46%,#1c131a_74%,#0c0a13_100%)] px-[max(1rem,env(safe-area-inset-left))] py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pr-[max(1rem,env(safe-area-inset-right))] pt-[max(1.5rem,env(safe-area-inset-top)+0.5rem)] text-white sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/40">Catalog</p>
            <h1 className="mt-1 font-[family-name:var(--font-serif)] text-2xl font-semibold">{listing.cocktail_name}</h1>
          </div>
          <Link
            href="/admin?tab=catalog"
            className="inline-flex min-h-10 items-center rounded-lg border border-white/15 bg-white/[0.03] px-4 py-2 text-sm text-white/80 hover:bg-white/[0.07]"
          >
            Back to catalog
          </Link>
        </header>

        <AdminEditListingForm listing={listing} error={formError} />
      </div>
    </main>
  );
}
