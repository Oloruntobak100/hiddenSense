"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LogoMark, Wordmark } from "@/components/brand/Logo";

const moodTeasers = [
  "Soft Life Loading",
  "Good Vibes Only",
  "Protecting My Peace",
  "Ready to TurnUp",
];

export function PostLoginIntro() {
  return (
    <main className="relative isolate flex h-[100dvh] w-full items-center justify-center overflow-hidden px-6 py-10 text-white">
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-[linear-gradient(160deg,#0a0911_10%,#140f1d_45%,#1a1217_70%,#0c0a13_100%)]"
      />
      <motion.div
        aria-hidden
        className="absolute -top-28 left-1/2 -z-10 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.36)_0%,rgba(124,58,237,0)_72%)] blur-2xl"
        animate={{ scale: [1, 1.08, 1], opacity: [0.55, 0.75, 0.55] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-40 right-[-8rem] -z-10 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(217,119,6,0.28)_0%,rgba(217,119,6,0)_72%)] blur-3xl"
        animate={{ x: [0, -12, 0], y: [0, 8, 0], opacity: [0.45, 0.65, 0.45] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(110%_80%_at_50%_20%,rgba(255,255,255,0.06),transparent_60%)]"
      />

      <motion.section
        className="mx-auto flex w-full max-w-3xl flex-col items-center text-center"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <motion.div
          className="mb-9 flex items-center gap-2.5"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <LogoMark className="h-11 w-9 object-contain" />
          <Wordmark className="font-[family-name:var(--font-display)] text-[15px] font-semibold uppercase tracking-[0.16em] text-white/90" />
        </motion.div>

        <motion.h1
          className="max-w-2xl text-balance font-[family-name:var(--font-serif)] text-[clamp(2rem,6.5vw,4.1rem)] font-semibold leading-[1.06] tracking-tight text-white"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.65 }}
        >
          Your mood has a flavor tonight.
        </motion.h1>

        <motion.p
          className="mt-6 max-w-xl text-pretty text-[15px] leading-relaxed text-white/78 sm:text-[17px]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.6 }}
        >
          HiddenSense™ translates your current energy into a personalized cocktail and food pairing experience.
        </motion.p>

        <motion.div
          className="mt-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
        >
          <Link
            href="/quiz"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-[var(--hs-accent-strong)] via-[#7b46ff] to-[var(--hs-accent)] px-9 py-3.5 text-[15px] font-semibold text-white shadow-[0_18px_38px_-16px_rgba(124,58,237,0.75)] transition duration-300 hover:brightness-110 hover:shadow-[0_22px_46px_-16px_rgba(124,58,237,0.82)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hs-accent)]"
          >
            Find My Mood
          </Link>
          <p className="mt-3 text-xs tracking-wide text-white/58">Takes less than 60 seconds.</p>
        </motion.div>
      </motion.section>

      <motion.div
        className="pointer-events-none absolute bottom-7 left-1/2 hidden -translate-x-1/2 gap-2.5 sm:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.7 }}
      >
        {moodTeasers.map((label) => (
          <span
            key={label}
            className="rounded-full border border-white/14 bg-white/[0.03] px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-white/45"
          >
            {label}
          </span>
        ))}
      </motion.div>
    </main>
  );
}
