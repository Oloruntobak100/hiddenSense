export function Spinner({ className }: { className?: string }) {
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
