import { notFound, redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { NavigatingLink } from "@/components/navigation/NavigatingLink";
import { ensureProfileId } from "@/lib/auth/ensure-profile";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profileId = await ensureProfileId();
  if (!profileId) redirect("/dashboard");

  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from("profiles")
    .select("first_name, email, phone")
    .eq("id", profileId)
    .maybeSingle();

  if (!data) notFound();

  return (
    <main className="relative min-h-[100dvh] overflow-hidden px-5 py-10 sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(160deg,#0a0911_12%,#151024_45%,#1d131a_72%,#0d0b14_100%),radial-gradient(130%_110%_at_18%_12%,rgba(124,58,237,0.22),transparent_52%)]"
      />
      <div className="mx-auto w-full max-w-xl rounded-3xl border border-white/12 bg-white/[0.04] p-6 shadow-2xl shadow-black/40 backdrop-blur-md sm:p-8">
        <p className="text-xs uppercase tracking-[0.16em] text-white/55">My account</p>
        <h1 className="mt-3 font-[family-name:var(--font-serif)] text-4xl font-semibold tracking-tight text-white">
          Welcome back, {data.first_name || "HiddenSense User"}!
        </h1>

        <div className="mt-8 space-y-4">
          <ProfileField label="First name" value={data.first_name || "Not set"} />
          <ProfileField label="Email" value={data.email || "Not set"} />
          <ProfileField label="Phone" value={data.phone || "Not set"} />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <NavigatingLink
            href="/dashboard"
            message="Returning to your dashboard…"
            className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-white/90 transition hover:bg-white/[0.1]"
          >
            Back to Intro
          </NavigatingLink>
          <SignOutButton className="inline-flex items-center justify-center rounded-xl border border-red-300/25 bg-red-500/10 px-5 py-2.5 text-sm font-medium text-red-100 transition hover:bg-red-500/20" />
        </div>
      </div>
    </main>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/12 bg-black/20 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">{label}</p>
      <p className="mt-1 text-base text-white">{value}</p>
    </div>
  );
}
