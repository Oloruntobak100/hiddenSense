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
      <main className="relative z-10 mx-auto flex min-h-[100dvh] max-w-lg flex-col justify-center px-6 py-12 sm:py-16">
      <div className="mb-10 text-center">
        <div className="mb-6 flex justify-center">
          <LogoMark />
        </div>
        <h1 className="font-[family-name:var(--font-serif)] text-5xl font-semibold tracking-tight text-[var(--hs-accent)] sm:text-[3rem]">
          Hello
        </h1>
        <p className="mt-3 text-pretty text-[var(--hs-muted)]">
          Create your account—verify your email with the code we send—then start your HiddenSense™ pairing.
        </p>
      </div>

      <div className="rounded-[2rem] bg-[var(--hs-panel)] p-6 shadow-2xl shadow-black/35 sm:p-8">
        <SignUpForm />
        <p className="mt-6 text-center text-xs text-[var(--hs-muted)]">
          By creating an account you agree Hidden Spirits may contact you per selections above (demo copy—legal review pending).
        </p>
      </div>

      <p className="mt-10 text-center text-sm text-[var(--hs-muted)]">
        <Link href="/" className="font-medium text-white/80 underline-offset-4 hover:underline">
          Back
        </Link>
      </p>
    </main>
    </>
  );
}
