import Link from "next/link";
import { Suspense } from "react";
import { LogoMark } from "@/components/brand/Logo";
import { AuthTabs } from "@/components/auth/AuthTabs";
import { TesterLoginForm } from "@/components/login/TesterLoginForm";
import { FixedAmbientBackground } from "@/components/visual/FixedAmbientBackground";
import { isOfflineDemoEnabled, isTesterUiEnabled } from "@/lib/features/tester-access";
import { AMBIENT_IMAGES } from "@/lib/media/ambient";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <>
      <FixedAmbientBackground
        src={AMBIENT_IMAGES.loginSocial}
        preset="login"
        objectPosition="center 60%"
      />
      <main className="relative z-10 mx-auto flex min-h-[100dvh] max-w-lg flex-col justify-center px-5 py-10 sm:px-6 sm:py-12">
        <div className="mb-6 flex justify-center">
          <LogoMark />
        </div>
        <p className="text-center font-[family-name:var(--font-serif)] text-3xl font-semibold tracking-tight text-[var(--hs-accent-strong)] sm:text-[2.1rem]">
          HiddenSense Access
        </p>
        <p className="mt-3 text-center text-sm text-[var(--hs-muted)]">
          Sign in or create your account to unlock your mood pairing experience.
        </p>

        <div className="mt-8">
          <Suspense
            fallback={
              <p className="text-center text-sm text-[var(--hs-muted)]">Loading access panel…</p>
            }
          >
            <AuthTabs />
          </Suspense>
        </div>

        {isTesterUiEnabled() ? (
          <div className="mx-auto mt-10 w-full max-w-md space-y-4">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[var(--hs-muted)]">
              Tester shortcut
            </p>
            <div className="rounded-[2rem] bg-[var(--hs-panel)]/90 p-6 shadow-xl shadow-black/30 backdrop-blur-sm">
              <TesterLoginForm />
              <p className="mt-4 text-center text-xs text-[var(--hs-muted)]">
                {isOfflineDemoEnabled()
                  ? "Offline demo works when Supabase insert fails in dev."
                  : "Uses disposable DB rows or offline demo when configured."}
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-10 space-y-3 text-center text-sm">
          <Link href="/logout" className="block text-[var(--hs-muted)] underline-offset-4 hover:text-white hover:underline">
            Sign out & clear session
          </Link>
          <Link href="/" className="block text-[var(--hs-muted)] hover:text-white">
            Home
          </Link>
        </div>
      </main>
    </>
  );
}
