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
      <main className="relative z-10 mx-auto flex h-[100dvh] max-h-[100dvh] w-full max-w-lg flex-col overflow-hidden px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex min-h-0 flex-1 flex-col justify-center">
          <div className="mb-4 shrink-0 text-center sm:mb-5">
            <div className="mb-3 flex justify-center sm:mb-4">
              <LogoMark />
            </div>
            <h1 className="font-[family-name:var(--font-serif)] text-4xl font-semibold tracking-tight text-[var(--hs-accent)] sm:text-[2.75rem]">
              Hello
            </h1>
            <p className="mt-2 text-pretty text-sm text-white/95 sm:mt-3 sm:text-base">
              Create your account—verify your email with the code we send—then start your HiddenSense™ pairing.
            </p>
          </div>

          <div className="min-h-0 shrink rounded-2xl bg-[var(--hs-panel)] p-4 shadow-2xl shadow-black/35 sm:p-5">
            <SignUpForm />
          </div>

          <p className="mt-3 shrink-0 text-center text-xs text-white/70 sm:mt-4">
            <Link href="/" className="font-medium text-white/85 underline-offset-4 hover:underline">
              Back
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
