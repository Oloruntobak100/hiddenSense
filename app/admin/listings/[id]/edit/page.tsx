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
        <Link href="/admin" className="mt-4 inline-block text-[var(--hs-accent)] underline-offset-2 hover:underline">
          Back to admin
        </Link>
      </main>
    );
  }

  const formError = typeof qs.error === "string" && qs.error.trim() ? qs.error.trim() : null;

  return (
    <main className="min-h-[100dvh] bg-[linear-gradient(160deg,#09080f_15%,#151024_46%,#1c131a_74%,#0c0a13_100%)] px-[max(1.25rem,env(safe-area-inset-left))] py-8 pb-[max(2rem,env(safe-area-inset-bottom))] pr-[max(1.25rem,env(safe-area-inset-right))] pt-[max(2rem,env(safe-area-inset-top)+0.75rem)] text-white sm:px-8 sm:py-10">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="font-[family-name:var(--font-serif)] text-2xl font-semibold">Edit listing</h1>
          <Link
            href="/admin"
            className="inline-flex min-h-11 items-center rounded-xl border border-white/20 bg-white/[0.04] px-4 py-2.5 text-sm hover:bg-white/[0.1]"
          >
            Back to admin
          </Link>
        </div>

        <div className="rounded-3xl border border-white/12 bg-white/[0.03] p-6 shadow-xl shadow-black/30">
          <AdminEditListingForm listing={listing} error={formError} />
        </div>
      </div>
    </main>
  );
}
