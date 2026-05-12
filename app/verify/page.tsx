import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoMark } from "@/components/brand/Logo";

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
    <main className="relative z-10 mx-auto flex min-h-[100dvh] max-w-lg flex-col justify-center px-6 py-12">
      <div className="mb-8 flex justify-center">
        <LogoMark />
      </div>
      <h1 className="text-center font-[family-name:var(--font-serif)] text-3xl font-semibold tracking-tight text-[var(--hs-accent-strong)] sm:text-4xl">
        Check your email
      </h1>
      <p className="mt-3 text-center text-sm text-white/75">
        We sent a confirmation link to <span className="font-semibold text-white">{email}</span>. Open it on this
        device to finish signing in—there is nothing to paste here.
      </p>

      <div className="mx-auto mt-10 w-full max-w-md rounded-[2rem] bg-[var(--hs-panel)] p-8 shadow-2xl shadow-black/35">
        <p className="text-sm leading-relaxed text-[var(--hs-ink)]">
          If you don&apos;t see the message within a few minutes, check spam or promotions. You can close this tab after
          you&apos;ve tapped the link.
        </p>
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
