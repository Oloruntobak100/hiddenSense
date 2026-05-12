import Link from "next/link";
import { Suspense } from "react";
import { LogoMark } from "@/components/brand/Logo";
import { EmbeddedAuthPanel } from "@/components/auth/EmbeddedAuthPanel";
import { FixedAmbientBackground } from "@/components/visual/FixedAmbientBackground";
import { AMBIENT_IMAGES } from "@/lib/media/ambient";
import { getSafeInternalNext } from "@/lib/auth/safe-next";

export const dynamic = "force-dynamic";

export default async function GatePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  const next = getSafeInternalNext(sp.next ?? null, "/dashboard");

  return (
    <>
      <FixedAmbientBackground
        src={AMBIENT_IMAGES.gateVault}
        preset="gate"
        objectPosition="center 40%"
      />
      <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-md flex-col justify-center gap-6 px-[max(1.25rem,env(safe-area-inset-left))] py-[max(2rem,env(safe-area-inset-bottom))] pr-[max(1.25rem,env(safe-area-inset-right))] pt-[max(2.5rem,env(safe-area-inset-top)+1.25rem)] sm:max-w-lg sm:px-6 sm:py-12">
        <header className="text-center">
          <div className="mb-4 flex justify-center sm:mb-5">
            <LogoMark />
          </div>
          <h1 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">
            Sign in or create account
          </h1>
          <p className="mx-auto mt-3 max-w-[26rem] text-pretty text-sm leading-relaxed text-white/90 sm:text-base">
            We&apos;ll email a magic link—tap it on this device. Returning on the same browser? Your email can be
            prefilled; after the first sign-in, you stay logged in until you sign out.
          </p>
        </header>

        <div className="relative w-full overflow-hidden rounded-3xl border border-white/45 bg-white/88 p-5 shadow-[0_28px_70px_-24px_rgba(0,0,0,0.65),0_0_0_1px_rgba(37,99,235,0.08)] backdrop-blur-xl sm:p-7">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--hs-accent)]/45 to-transparent"
          />
          <Suspense fallback={<p className="text-center text-sm text-[var(--hs-muted)]">Loading form…</p>}>
            <EmbeddedAuthPanel authNextPath={next} />
          </Suspense>
        </div>

        <p className="text-center text-xs text-white/65 sm:text-sm">
          <Link href="/" className="font-medium text-white/90 underline-offset-4 hover:text-white hover:underline">
            Back
          </Link>
        </p>
      </main>
    </>
  );
}
