import Image from "next/image";

export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.svg"
      alt="Hidden Spirits glass mark"
      width={48}
      height={60}
      className={className}
      priority
    />
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={["font-semibold tracking-tight", className].filter(Boolean).join(" ")}>
      HiddenSense<sup className="text-[0.45em] font-normal">™</sup>
    </span>
  );
}
