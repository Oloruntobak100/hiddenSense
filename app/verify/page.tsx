import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoMark } from "@/components/brand/Logo";
import { VerifyCodeForm } from "@/components/auth/VerifyCodeForm";
import { FixedAmbientBackground } from "@/components/visual/FixedAmbientBackground";
import { AMBIENT_IMAGES } from "@/lib/media/ambient";

export const dynamic = "force-dynamic";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email: raw } = await searchParams;
  const email = raw?.trim() ?? "";

  if (!email) {
    redirect("/gate");
  }

  return (
    <>
      <FixedAmbientBackground
        src={AMBIENT_IMAGES.gateVault}
        preset="gate"
        objectPosition="center 35%"
      />
      <main className="relative z-10 mx-auto flex min-h-[100dvh] max-w-lg flex-col justify-center px-6 py-12">
        <div className="mb-8 flex justify-center">
          <LogoMark />
        </div>
        <h1 className="text-center font-[family-name:var(--font-serif)] text-3xl font-semibold tracking-tight text-[var(--hs-accent-strong)] sm:text-4xl">
          Enter verification code
        </h1>
        <p className="mt-3 text-center text-sm text-[var(--hs-muted)]">
          We sent a code to <span className="font-medium text-[var(--hs-ink)]">{email}</span>. Paste it below—spaces are fine.
        </p>

        <div className="mx-auto mt-10 w-full max-w-md rounded-[2rem] bg-[var(--hs-panel)] p-8 shadow-2xl shadow-black/35">
          <VerifyCodeForm email={email} />
        </div>

        <p className="mt-10 text-center text-sm text-[var(--hs-muted)]">
          <Link href="/" className="underline-offset-4 hover:text-white hover:underline">
            Home
          </Link>
        </p>
      </main>
    </>
  );
}
