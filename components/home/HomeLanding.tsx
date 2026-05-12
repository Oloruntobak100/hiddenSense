"use client";

import Image from "next/image";
import Link from "next/link";
import { LogoMark, Wordmark } from "@/components/brand/Logo";
import { AgeConsentGate } from "@/components/home/AgeConsentGate";

type Props = {
  showTesterLogin: boolean;
};

export function HomeLanding({ showTesterLogin }: Props) {
  return (
    <AgeConsentGate>
      {(openAgeGate) => (
      <div className="relative z-10">
        <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#09080f]/72 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
          <nav className="mx-auto max-w-6xl px-[max(1.25rem,env(safe-area-inset-left))] py-3 pr-[max(1.25rem,env(safe-area-inset-right))] sm:px-6 sm:py-4">
            <div className="flex items-center justify-between gap-3">
              <Link
                href="/"
                className="flex min-h-11 min-w-0 shrink-0 items-center gap-2.5 text-white transition hover:opacity-90 sm:gap-3"
              >
                <LogoMark className="h-9 w-[1.85rem] object-contain sm:h-11 sm:w-9" />
                <Wordmark className="font-[family-name:var(--font-display)] truncate text-[12px] font-semibold uppercase tracking-[0.16em] text-white sm:text-sm sm:tracking-[0.18em]" />
              </Link>

              <div className="hidden flex-1 justify-center gap-10 md:flex">
                <a
                  href="#features"
                  className="text-[13px] font-medium text-white/65 transition hover:text-white"
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  className="text-[13px] font-medium text-white/65 transition hover:text-white"
                >
                  How it works
                </a>
              </div>

              <button
                type="button"
                onClick={() => openAgeGate("quiz")}
                className="inline-flex min-h-11 shrink-0 items-center rounded-lg bg-[var(--hs-accent)] px-4 py-2.5 text-[12px] font-bold uppercase tracking-[0.14em] text-white shadow-[0_0_22px_-4px_rgba(37,99,235,0.55)] transition hover:brightness-110 sm:px-5 sm:text-[13px]"
              >
                Get started
              </button>
            </div>
            <div className="hs-hide-scrollbar mt-2 flex justify-center gap-10 overflow-x-auto py-2.5 pb-3 md:hidden">
              <a
                href="#features"
                className="shrink-0 text-[13px] font-medium text-white/65 transition hover:text-white"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="shrink-0 text-[13px] font-medium text-white/65 transition hover:text-white"
              >
                How it works
              </a>
            </div>
          </nav>
        </header>

        <main>
          <section className="relative overflow-hidden">
            <Image
              src="/home-bg-cocktails.png"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: "center 48%" }}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#09080f]/72 via-[#09080f]/58 to-[#09080f]/78" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(100%_80%_at_65%_12%,rgba(234,88,12,0.18),transparent_52%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(95%_95%_at_15%_18%,rgba(124,58,237,0.12),transparent_52%)]" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

            <div className="relative mx-auto flex min-h-[min(100dvh,820px)] max-w-5xl flex-col justify-center px-[max(1.25rem,env(safe-area-inset-left))] pb-[max(4rem,env(safe-area-inset-bottom)+2.5rem)] pt-[max(3.25rem,env(safe-area-inset-top)+1.75rem)] pr-[max(1.25rem,env(safe-area-inset-right))] text-center sm:min-h-[72vh] sm:px-6 sm:pb-20 sm:pt-20 md:min-h-[76vh] md:pt-24">
            <h1 className="font-[family-name:var(--font-display)] mt-4 text-[clamp(1.2rem,4.5vw,2.45rem)] font-extrabold uppercase leading-[1.1] tracking-[0.048em] [text-shadow:0_2px_18px_rgba(0,0,0,0.55)] sm:mt-5 sm:tracking-[0.055em]">
              <span className="block text-white">How you feel</span>
              <span className="mt-2 block bg-gradient-to-r from-[var(--hs-accent)] via-sky-400 to-[var(--hs-accent-strong)] bg-clip-text text-transparent">
                shapes every pour
              </span>
              <span className="mt-2 block text-white/95">&amp; every bite</span>
            </h1>

            <p className="mx-auto mt-7 max-w-2xl text-pretty text-sm leading-relaxed text-white/90 [text-shadow:0_2px_14px_rgba(0,0,0,0.45)] sm:text-base">
              HiddenSense™ translates the moment—five quick taps—into cocktail and plate inspiration from Hidden Spirits.
              Curated, human-feeling, built for right now.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row sm:gap-4">
              <button
                type="button"
                onClick={() => openAgeGate("quiz")}
                className="inline-flex w-full max-w-[13rem] items-center justify-center gap-1.5 rounded-xl bg-[var(--hs-accent)] px-6 py-3 text-[14px] font-semibold text-white shadow-[0_16px_40px_-12px_rgba(37,99,235,0.65)] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hs-accent)] sm:w-auto"
              >
                <span aria-hidden className="text-base leading-none">
                  ⚡
                </span>
                Get started
                <span aria-hidden className="text-base">
                  →
                </span>
              </button>
              <a
                href="#how-it-works"
                className="inline-flex w-full max-w-[13rem] items-center justify-center gap-1.5 rounded-xl border border-white/30 bg-black/25 px-6 py-3 text-[14px] font-semibold text-white/95 backdrop-blur-sm transition hover:border-white/45 hover:bg-black/35 sm:w-auto"
              >
                How it works
              </a>
            </div>
            </div>
          </section>

          {/* Product preview strip */}
          <div className="mx-auto mt-16 max-w-4xl overflow-hidden rounded-2xl border border-[var(--hs-accent)]/35 bg-[#0c0b12]/85 p-1 shadow-[0_24px_80px_-28px_rgba(37,99,235,0.35)] backdrop-blur-md">
              <div className="rounded-[14px] border border-white/[0.07] bg-gradient-to-b from-white/[0.06] to-transparent px-4 py-3 sm:px-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-[family-name:var(--font-display)] text-[11px] font-bold uppercase tracking-[0.2em] text-white/90">
                      Pairing studio
                    </span>
                  </div>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-400/95">
                    ● Live preview
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: "Moods mapped", value: "12+", tone: "text-sky-300" },
                    { label: "Pairings crafted", value: "∞", tone: "text-violet-300" },
                    { label: "Spirits library", value: "Vault", tone: "text-fuchsia-300/95" },
                    { label: "Time to tap in", value: "< 1 min", tone: "text-emerald-300" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl border border-white/[0.06] bg-black/35 px-3 py-3 text-left sm:py-3.5"
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">{item.label}</p>
                      <p className={`font-[family-name:var(--font-display)] mt-1.5 text-xl font-bold ${item.tone}`}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
          </div>

          <section id="features" className="scroll-mt-28 border-t border-white/[0.06] bg-black/20 py-16 sm:py-20">
            <div className="mx-auto max-w-6xl px-5 sm:px-6">
              <h2 className="font-[family-name:var(--font-display)] text-center text-xl font-bold uppercase tracking-[0.18em] text-white sm:text-2xl">
                Built for the moment
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-center text-sm text-white/60">
                Signal from mood. Output from Hidden Spirits—cocktails and plates you can actually order toward.
              </p>
              <ul className="mt-12 grid gap-6 md:grid-cols-3">
                {[
                  {
                    title: "Mood quiz",
                    body: "Five taps capture tone and tension—no essays, no fluff.",
                  },
                  {
                    title: "Curated pairings",
                    body: "Cocktail + food suggestions tuned to how you feel tonight.",
                  },
                  {
                    title: "Hidden Spirits",
                    body: "Born from the vault—premium cues without the pretension.",
                  },
                ].map((card) => (
                  <li
                    key={card.title}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm transition hover:border-[var(--hs-accent)]/35"
                  >
                    <h3 className="font-[family-name:var(--font-display)] text-sm font-bold uppercase tracking-[0.14em] text-[var(--hs-accent)]">
                      {card.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/72">{card.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section id="how-it-works" className="scroll-mt-28 py-16 sm:py-20">
            <div className="mx-auto max-w-6xl px-5 sm:px-6">
              <h2 className="font-[family-name:var(--font-display)] text-center text-xl font-bold uppercase tracking-[0.18em] text-white sm:text-2xl">
                How it works
              </h2>
              <ol className="mx-auto mt-12 grid max-w-3xl gap-8">
                {[
                  "Create your account—we verify email so your pairing stays yours.",
                  "Take the five-tap quiz: fast, intuitive, impossible to overthink.",
                  "Unlock your HiddenSense™ pairing and step into the evening you want.",
                ].map((step, i) => (
                  <li key={step} className="flex gap-5 text-left">
                    <span className="font-[family-name:var(--font-display)] flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--hs-accent)]/40 bg-[var(--hs-accent)]/15 text-sm font-bold text-[var(--hs-accent)]">
                      {i + 1}
                    </span>
                    <p className="pt-1.5 text-sm leading-relaxed text-white/75 sm:text-base">{step}</p>
                  </li>
                ))}
              </ol>
              <div className="mt-12 flex justify-center">
                <button
                  type="button"
                  onClick={() => openAgeGate("quiz")}
                  className="rounded-xl bg-[var(--hs-accent)] px-10 py-3.5 text-[15px] font-semibold text-white shadow-[0_14px_36px_-14px_rgba(37,99,235,0.6)] transition hover:brightness-110"
                >
                  Get started
                </button>
              </div>
            </div>
          </section>

          <footer className="border-t border-white/[0.08] bg-[#09080f]/80 py-12 backdrop-blur-md">
            <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-5 text-center sm:px-6">
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm">
                <button
                  type="button"
                  onClick={() => openAgeGate("quiz")}
                  className="font-medium text-white/85 underline-offset-4 hover:text-white hover:underline"
                >
                  Get started
                </button>
                <button
                  type="button"
                  onClick={() => openAgeGate("login")}
                  className="font-medium text-[var(--hs-accent)] underline-offset-4 hover:underline"
                >
                  Sign in
                </button>
                <Link href="/" className="text-white/55 underline-offset-4 hover:text-white/90 hover:underline">
                  Home
                </Link>
              </div>
              <p className="text-xs text-white/40">
                HiddenSense™ • Hidden Spirits • MVP prototype
              </p>
              {showTesterLogin ? (
                <Link href="/login" className="text-xs text-white/55 underline-offset-4 hover:text-white hover:underline">
                  Tester login (skip gate)
                </Link>
              ) : null}
            </div>
          </footer>
        </main>
      </div>
      )}
    </AgeConsentGate>
  );
}
