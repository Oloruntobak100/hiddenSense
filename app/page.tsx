import Link from "next/link";
import { LogoMark, Wordmark } from "@/components/brand/Logo";
import { FixedAmbientBackground } from "@/components/visual/FixedAmbientBackground";
import { isTesterUiEnabled } from "@/lib/features/tester-access";
import { AMBIENT_IMAGES } from "@/lib/media/ambient";

export default function Home() {
  const showTesterLogin = isTesterUiEnabled();

  return (
    <>
      <FixedAmbientBackground
        src={AMBIENT_IMAGES.homeHero}
        preset="hero"
        priority
        objectPosition="center 55%"
      />
      <main className="relative z-10 mx-auto flex min-h-[100dvh] max-w-2xl flex-col items-center justify-center gap-10 px-6 py-16 text-center">
      <div className="flex flex-col items-center gap-3">
        <LogoMark />
        <div className="text-3xl tracking-tight text-white">
          <Wordmark />
        </div>
        <p className="font-[family-name:var(--font-serif)] text-xl text-white/85 sm:text-2xl">
          How you feel, bottled.
        </p>
      </div>
      <p className="max-w-md text-pretty text-base leading-relaxed text-[var(--hs-muted)] sm:text-[15px]">
        A gated mood pairing experience from Hidden Spirits. Enter the vault—answer five quick taps—and we&apos;ll craft
        cocktail + plate inspiration tuned to right now (prototype).
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/gate"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--hs-accent-strong)] px-10 py-4 text-lg font-semibold text-white shadow-lg shadow-purple-950/40 transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hs-accent-strong)]"
        >
          Begin
          <span aria-hidden>→</span>
        </Link>
        <Link
          href="/gate"
          className="text-sm font-medium text-white/70 underline underline-offset-4 hover:text-white"
        >
          I already unlocked
        </Link>
      </div>
      <footer className="flex flex-col items-center gap-2 text-xs text-white/40">
        <span>MVP prototype • Supabase-backed • Mobile-first funnel</span>
        {showTesterLogin ? (
          <Link href="/login" className="text-white/60 underline-offset-4 hover:text-white hover:underline">
            Tester login (skip gate)
          </Link>
        ) : null}
      </footer>
    </main>
    </>
  );
}
