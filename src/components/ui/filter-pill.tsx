"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface FilterPillProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  /** Classes applied only while active — lets status pills carry their colour. */
  activeClassName?: string;
  count?: number;
}

/** Toggleable pill used by the collection filter bar. */
export function FilterPill({
  active,
  onClick,
  children,
  activeClassName,
  count,
}: FilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap",
        active
          ? (activeClassName ?? "bg-primary text-primary-ink")
          : "text-ink-muted ring-1 ring-border-base hover:bg-surface-sunken hover:text-ink",
      )}
    >
      {children}
      {count !== undefined && (
        <span
          className={cn(
            "tabular-nums",
            active ? "opacity-70" : "text-ink-subtle",
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
