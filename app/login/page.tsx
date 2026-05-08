import Link from "next/link";
import { Suspense } from "react";
import { LogoMark } from "@/components/brand/Logo";
import { AuthTabs } from "@/components/auth/AuthTabs";
import { TesterLoginForm } from "@/components/login/TesterLoginForm";
import { isOfflineDemoEnabled, isTesterUiEnabled } from "@/lib/features/tester-access";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main className="relative z-10 mx-auto flex h-[100dvh] max-h-[100dvh] w-full max-w-lg flex-col justify-center overflow-hidden px-4 py-4 sm:px-6 sm:py-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_120%_at_18%_8%,rgba(124,58,237,0.3),transparent_54%),radial-gradient(95%_95%_at_90%_34%,rgba(37,99,235,0.2),transparent_48%)]"
      />
      <div className="rounded-3xl border border-white/10 bg-black/20 p-4 shadow-[0_30px_90px_-40px_rgba(0,0,0,0.8)] backdrop-blur-[2px] sm:p-5">
        <div className="mb-4 flex justify-center">
          <LogoMark />
        </div>
        <p className="text-center font-[family-name:var(--font-serif)] text-3xl font-semibold tracking-tight text-white sm:text-[2.05rem]">
          HiddenSense Access
        </p>
        <p className="mt-2 text-center text-sm text-white/75">
          Sign in or create your account to unlock your mood pairing experience.
        </p>

        <div className="mt-4">
          <Suspense
            fallback={
              <p className="text-center text-sm text-white/70">Loading access panel…</p>
            }
          >
            <AuthTabs />
          </Suspense>
        </div>

        {isTesterUiEnabled() ? (
          <div className="mx-auto mt-4 w-full max-w-md space-y-2.5">
            <p className="text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
              Tester shortcut
            </p>
            <div className="rounded-2xl bg-[var(--hs-panel)]/92 p-4 shadow-xl shadow-black/30 backdrop-blur-sm">
              <TesterLoginForm />
              <p className="mt-3 text-center text-[11px] text-[var(--hs-muted)]">
                {isOfflineDemoEnabled()
                  ? "Offline demo works when Supabase insert fails in dev."
                  : "Uses disposable DB rows or offline demo when configured."}
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-4 space-y-2 text-center text-xs">
          <Link href="/logout" className="block text-white/55 underline-offset-4 hover:text-white hover:underline">
            Sign out & clear session
          </Link>
          <Link href="/" className="block text-white/55 hover:text-white">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
