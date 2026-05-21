import { LogoMark } from "@/components/brand/Logo";
import { Spinner } from "@/components/ui/Spinner";

type PageLoadingScreenProps = {
  message?: string;
};

/** Full-viewport loader — matches PrimaryButton shimmer/spinner (quiz reveal, navigation). */
export function PageLoadingScreen({ message = "Loading…" }: PageLoadingScreenProps) {
  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden px-6 text-white"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={message}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,#0a0911_10%,#140f1d_45%,#1a1217_70%,#0c0a13_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-28 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.36)_0%,rgba(124,58,237,0)_72%)] blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(110%_80%_at_50%_20%,rgba(255,255,255,0.06),transparent_60%)]"
      />

      <div className="relative z-10 flex flex-col items-center text-center">
        <LogoMark className="mb-8 h-12 w-10 object-contain opacity-90" />
        <div className="hs-primary-button relative inline-flex min-w-[min(100%,18rem)] items-center justify-center gap-3 overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-r from-[var(--hs-accent-strong)] to-[var(--hs-accent)] px-8 py-4 text-base font-semibold shadow-[0_18px_40px_-18px_rgba(124,58,237,0.75)]">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
          >
            <span className="hs-btn-shimmer-bar absolute inset-y-0 w-[55%] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-80" />
          </span>
          <Spinner className="relative z-[1] h-6 w-6 shrink-0 text-white" />
          <span className="relative z-[1] text-pretty">{message}</span>
        </div>
      </div>
    </div>
  );
}
