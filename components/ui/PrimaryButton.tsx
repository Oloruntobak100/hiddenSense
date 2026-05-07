import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "ghost";
};

export function PrimaryButton({
  children,
  className = "",
  variant = "primary",
  type = "button",
  ...rest
}: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-base font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 motion-safe:transition-transform motion-safe:active:scale-[0.98]";
  const styles =
    variant === "primary"
      ? "bg-[var(--hs-accent)] text-white focus-visible:outline-[var(--hs-accent)]"
      : "border border-white/15 bg-white/5 text-white hover:bg-white/10 focus-visible:outline-white/40";

  return (
    <button type={type} className={`${base} ${styles} ${className}`} {...rest}>
      {children}
    </button>
  );
}
