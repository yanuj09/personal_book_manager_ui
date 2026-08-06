import { cn } from "@/lib/cn";

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      className={cn("animate-spin", className)}
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        opacity="0.25"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Full-panel loading state for routes that are still resolving. */
export function LoadingPanel({ label = "Loading" }: { label?: string }) {
  return (
    <div
      className="flex min-h-60 flex-col items-center justify-center gap-3 text-ink-subtle"
      role="status"
      aria-live="polite"
    >
      <Spinner className="text-2xl" />
      <span className="text-sm">{label}…</span>
    </div>
  );
}
