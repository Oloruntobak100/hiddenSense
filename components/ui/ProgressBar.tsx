export function ProgressBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10">
      <div
        className="h-full rounded-full bg-[var(--hs-accent)] motion-safe:transition-[width] motion-safe:duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
