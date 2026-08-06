import { cn } from "@/lib/cn";

interface ProgressBarProps {
  /** 0–100. */
  value: number;
  label?: string;
  showValue?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  label,
  showValue = false,
  className,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Reading progress"}
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-sunken"
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showValue && (
        <span className="shrink-0 text-[11px] font-medium tabular-nums text-ink-muted">
          {clamped}%
        </span>
      )}
    </div>
  );
}
