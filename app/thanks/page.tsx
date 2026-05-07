import Link from "next/link";
import { LogoMark } from "@/components/brand/Logo";

export const dynamic = "force-dynamic";

export default function ThanksPage() {
  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-lg flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <LogoMark />
      <h1 className="font-[family-name:var(--font-serif)] text-4xl font-semibold tracking-tight text-white">
        Thank you for the honesty
      </h1>
      <p className="max-w-sm text-[var(--hs-muted)]">
        Your feedback sharpens HiddenSense™ recommendations for the Hidden Spirits vault.
      </p>
      <Link
        href="/"
        className="rounded-2xl bg-white px-8 py-4 text-lg font-semibold text-[var(--hs-ink)] shadow-lg hover:bg-white/95"
      >
        Return home
      </Link>
    </main>
  );
}
