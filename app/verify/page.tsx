import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LogoMark } from "@/components/brand/Logo";
import { VerifyCodeForm } from "@/components/auth/VerifyCodeForm";
import { getSafeInternalNext } from "@/lib/auth/safe-next";

export const dynamic = "force-dynamic";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; next?: string; flow?: string }>;
}) {
  const { email: raw, next: nextRaw, flow: flowRaw } = await searchParams;
  const email = raw?.trim() ?? "";

  if (!email) {
    redirect("/login");
  }

  const nextPath = getSafeInternalNext(nextRaw ?? null, "/dashboard");
  const flow = flowRaw === "signup" ? "signup" : "signin";

  return (
    <main className="relative z-10 mx-auto flex min-h-[100dvh] max-w-lg flex-col justify-center px-6 py-12">
      <div className="mb-8 flex justify-center">
        <LogoMark />
      </div>
      <h1 className="text-center font-[family-name:var(--font-serif)] text-3xl font-semibold tracking-tight text-[var(--hs-accent-strong)] sm:text-4xl">
        Enter verification code
      </h1>
      <p className="mt-3 text-center text-sm text-white/75">
        We sent a code to <span className="font-semibold text-white">{email}</span>. Enter it below to
        continue.
      </p>

      <div className="mx-auto mt-8 w-full max-w-md rounded-[1.5rem] border border-white/20 bg-[var(--hs-panel)]/95 p-5 shadow-2xl shadow-black/40 backdrop-blur-md sm:p-6">
        <Suspense fallback={<p className="text-center text-sm text-[var(--hs-muted)]">Loading…</p>}>
          <VerifyCodeForm email={email} nextPath={nextPath} flow={flow} />
        </Suspense>
      </div>

      <p className="mt-10 text-center text-sm text-white/80">
        <Link href="/login" className="text-white/85 underline-offset-4 hover:text-white hover:underline">
          Back to sign in
        </Link>
        <span className="mx-2 text-white/35">·</span>
        <Link href="/" className="text-white/85 underline-offset-4 hover:text-white hover:underline">
          Home
        </Link>
      </p>
    </main>
  );
}
