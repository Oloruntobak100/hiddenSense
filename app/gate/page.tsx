import Link from "next/link";
import { LogoMark } from "@/components/brand/Logo";
import { SignUpForm } from "@/components/gate/SignUpForm";
import { FixedAmbientBackground } from "@/components/visual/FixedAmbientBackground";
import { AMBIENT_IMAGES } from "@/lib/media/ambient";

export const dynamic = "force-dynamic";

export default async function GatePage() {
  return (
    <>
      <FixedAmbientBackground
        src={AMBIENT_IMAGES.gateVault}
        preset="gate"
        objectPosition="center 40%"
      />
      <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-md flex-col justify-center gap-6 px-5 py-10 sm:max-w-lg sm:px-6 sm:py-12">
        <header className="text-center">
          <div className="mb-4 flex justify-center sm:mb-5">
            <LogoMark />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">
            Create account
          </p>
          <h1 className="mt-2 bg-gradient-to-br from-[var(--hs-accent-strong)] to-[var(--hs-accent)] bg-clip-text font-[family-name:var(--font-serif)] text-4xl font-semibold tracking-tight text-transparent sm:text-[2.75rem]">
            Hello
          </h1>
          <p className="mx-auto mt-3 max-w-[26rem] text-pretty text-sm leading-relaxed text-white/90 sm:text-base">
            Create your account—verify your email with the code we send—then start your HiddenSense™ pairing.
          </p>
        </header>

        <div className="relative w-full overflow-hidden rounded-3xl border border-white/45 bg-white/88 p-5 shadow-[0_28px_70px_-24px_rgba(0,0,0,0.65),0_0_0_1px_rgba(37,99,235,0.08)] backdrop-blur-xl sm:p-7">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--hs-accent)]/45 to-transparent"
          />
          <SignUpForm />
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
