import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: number;
  icon: ReactNode;
  /** Quiet secondary line, e.g. "62% average progress". */
  footnote?: string;
  accentClassName?: string;
}

export function StatCard({
  label,
  value,
  icon,
  footnote,
  accentClassName,
}: StatCardProps) {
  return (
    <Card className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-medium tracking-wide text-ink-muted">
          {label}
        </p>
        <p className="mt-1.5 text-3xl font-semibold tabular-nums tracking-tight text-ink">
          {value}
        </p>
        {footnote && (
          <p className="mt-1 truncate text-xs text-ink-subtle">{footnote}</p>
        )}
      </div>
      <span
        aria-hidden="true"
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg",
          accentClassName ?? "bg-surface-sunken text-ink-subtle",
        )}
      >
        {icon}
      </span>
    </Card>
  );
}
