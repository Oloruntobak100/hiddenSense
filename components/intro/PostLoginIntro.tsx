"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { LogoMark, Wordmark } from "@/components/brand/Logo";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { NavigatingLink } from "@/components/navigation/NavigatingLink";
import { MyResultsModal } from "@/components/results/MyResultsModal";
import type { MyResultItem } from "@/lib/data/my-results";

type Props = {
  displayName: string;
  isAdmin: boolean;
  myResults?: MyResultItem[];
};

function OpenResultsFromQuery({ onOpen }: { onOpen: () => void }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("results") !== "1") return;
    onOpen();
    router.replace("/dashboard", { scroll: false });
  }, [searchParams, router, onOpen]);

  return null;
}

export function PostLoginIntro({ displayName, isAdmin, myResults = [] }: Props) {
  const [open, setOpen] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
  const initials = useMemo(
    () =>
      displayName
        .split(" ")
        .map((s) => s[0]?.toUpperCase() ?? "")
        .join("")
        .slice(0, 2) || "HS",
    [displayName],
  );

  return (
    <main className="relative isolate flex max-h-[100dvh] min-h-[100dvh] w-full items-center justify-center overflow-x-hidden overflow-y-auto pb-[max(1.25rem,env(safe-area-inset-bottom))] pl-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] pt-[max(1.75rem,env(safe-area-inset-top)+0.5rem)] text-white">
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
      <div className="absolute right-[max(1rem,env(safe-area-inset-right))] top-[max(0.75rem,env(safe-area-inset-top)+0.25rem)] z-20 sm:right-8 sm:top-7">
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="group inline-flex min-h-11 min-w-11 items-center gap-2 rounded-full border border-white/20 bg-white/[0.05] px-2 py-1.5 backdrop-blur-sm transition active:bg-white/[0.14] hover:bg-white/[0.1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hs-accent)]"
            aria-expanded={open}
            aria-label={`Account menu for ${displayName}`}
          >
            <span className="hidden max-w-[10rem] truncate text-xs text-white/75 sm:inline">Welcome back, {displayName}!</span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--hs-accent-strong)] to-[var(--hs-accent)] text-xs font-semibold text-white shadow-[0_8px_18px_-10px_rgba(124,58,237,0.9)] sm:h-8 sm:w-8">
              {initials}
            </span>
          </button>

          {open ? (
            <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-white/15 bg-[#151222]/95 p-2 shadow-2xl shadow-black/55 backdrop-blur-md">
              <p className="px-3 pb-2 pt-1 text-sm text-white/85">Welcome back, {displayName}!</p>
              <NavigatingLink
                href="/profile"
                message="Loading your profile…"
                onClick={() => setOpen(false)}
                className="block w-full rounded-xl px-3 py-2 text-left text-sm text-white/85 transition hover:bg-white/10 hover:text-white"
              >
                Manage Profile
              </NavigatingLink>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setResultsOpen(true);
                }}
                className="block w-full rounded-xl px-3 py-2 text-left text-sm text-white/85 transition hover:bg-white/10 hover:text-white"
              >
                My Results
                {myResults.length > 0 ? (
                  <span className="ml-1 text-white/45">({myResults.length})</span>
                ) : null}
              </button>
              {isAdmin ? (
                <NavigatingLink
                  href="/admin"
                  message="Opening admin dashboard…"
                  onClick={() => setOpen(false)}
                  className="block w-full rounded-xl px-3 py-2 text-left text-sm text-indigo-200 transition hover:bg-indigo-500/15 hover:text-indigo-100"
                >
                  Admin Dashboard
                </NavigatingLink>
              ) : null}
              <SignOutButton
                className="block w-full rounded-xl px-3 py-2 text-left text-sm text-red-200 transition hover:bg-red-500/15 hover:text-red-100"
              />
            </div>
          ) : null}
        </div>
      </div>

      <motion.section
        className="mx-auto my-auto flex w-full max-w-3xl flex-col items-center py-6 text-center sm:py-0"
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
          className="max-w-2xl text-balance font-[family-name:var(--font-serif)] text-[clamp(1.65rem,7vw,4.1rem)] font-semibold leading-[1.08] tracking-tight text-white sm:leading-[1.06]"
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
          <NavigatingLink
            href="/quiz"
            message="Starting your mood pairing…"
            className="inline-flex w-full max-w-sm min-[420px]:w-auto min-h-[3.25rem] items-center justify-center rounded-2xl bg-gradient-to-r from-[var(--hs-accent-strong)] via-[#7b46ff] to-[var(--hs-accent)] px-8 py-3.5 text-[15px] font-semibold text-white shadow-[0_18px_38px_-16px_rgba(124,58,237,0.75)] transition duration-300 hover:brightness-110 hover:shadow-[0_22px_46px_-16px_rgba(124,58,237,0.82)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hs-accent)] sm:min-h-12 sm:max-w-none sm:px-9"
          >
            Find My Mood
          </NavigatingLink>
          <p className="mt-3 text-xs tracking-wide text-white/58">Takes less than 60 seconds.</p>
        </motion.div>
      </motion.section>

      <Suspense fallback={null}>
        <OpenResultsFromQuery onOpen={() => setResultsOpen(true)} />
      </Suspense>

      <MyResultsModal
        open={resultsOpen}
        onClose={() => setResultsOpen(false)}
        items={myResults}
        displayName={displayName}
      />
    </main>
  );
}
