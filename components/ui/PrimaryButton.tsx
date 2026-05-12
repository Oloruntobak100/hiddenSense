"use client";

import {
  forwardRef,
  useCallback,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

export type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "ghost";
  /** Shows spinner, shimmer, and blocks interaction while true. */
  loading?: boolean;
};

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={`animate-spin ${className ?? ""}`}
    >
      <circle
        className="opacity-80"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeDasharray="14 46"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export const PrimaryButton = forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  function PrimaryButton(
    {
      children,
      className = "",
      variant = "primary",
      type = "button",
      loading = false,
      disabled,
      onPointerDown,
      onAnimationEnd,
      ...rest
    },
    ref,
  ) {
    const [tapRing, setTapRing] = useState(false);
    const busy = Boolean(loading || disabled);

    const handlePointerDown = useCallback(
      (e: React.PointerEvent<HTMLButtonElement>) => {
        if (loading || disabled) return;
        setTapRing(true);
        onPointerDown?.(e);
      },
      [disabled, loading, onPointerDown],
    );

    const handleAnimEnd = useCallback(
      (e: React.AnimationEvent<HTMLButtonElement>) => {
        if (e.animationName.includes("hs-btn-tap-ring")) setTapRing(false);
        onAnimationEnd?.(e);
      },
      [onAnimationEnd],
    );

    const base =
      "hs-primary-button relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl px-6 py-3.5 text-base font-semibold transition-[transform,box-shadow,filter] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:transition-transform motion-safe:active:scale-[0.98] disabled:cursor-not-allowed";
    const styles =
      variant === "primary"
        ? "bg-[var(--hs-accent)] text-white shadow-[0_8px_24px_-6px_rgba(37,99,235,0.55)] focus-visible:outline-[var(--hs-accent)] hover:brightness-[1.03] disabled:opacity-55 [&[data-loading]]:opacity-100 [&[data-loading]]:brightness-100"
        : "border border-white/15 bg-white/5 text-white hover:bg-white/10 focus-visible:outline-white/40 disabled:opacity-45 [&[data-loading]]:opacity-100";

    return (
      <button
        ref={ref}
        type={type}
        data-loading={loading ? "" : undefined}
        disabled={busy}
        aria-busy={loading || undefined}
        onPointerDown={handlePointerDown}
        onAnimationEnd={handleAnimEnd}
        className={`${base} ${styles} ${tapRing ? "hs-btn-tap-ring" : ""} ${className}`}
        {...rest}
      >
        {loading ? (
          <>
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
            >
              <span className="hs-btn-shimmer-bar absolute inset-y-0 w-[55%] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-80" />
            </span>
            <Spinner className="relative z-[1] h-[1.05em] w-[1.05em] shrink-0 text-current" />
            <span className="relative z-[1] min-w-0">{children}</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

PrimaryButton.displayName = "PrimaryButton";
