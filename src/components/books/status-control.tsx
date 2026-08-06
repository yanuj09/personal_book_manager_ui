"use client";

import { cn } from "@/lib/cn";
import { BOOK_STATUS_LIST, type BookStatus } from "@/models/book.model";

interface StatusControlProps {
  value: BookStatus;
  onChange: (status: BookStatus) => void;
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
}

/**
 * Three-way segmented control for a book's reading status.
 *
 * Shows all three states at once rather than hiding them behind a dropdown —
 * marking a book as read is the most common action in the app, so it should
 * cost one click, not two.
 */
export function StatusControl({
  value,
  onChange,
  size = "md",
  disabled = false,
  className,
}: StatusControlProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Reading status"
      className={cn(
        "inline-flex rounded-lg bg-surface-sunken p-0.5",
        disabled && "opacity-60",
        className,
      )}
    >
      {BOOK_STATUS_LIST.map((meta) => {
        const active = meta.value === value;
        return (
          <button
            key={meta.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => !active && onChange(meta.value)}
            title={meta.label}
            className={cn(
              "rounded-[7px] font-medium transition-all duration-150 whitespace-nowrap",
              size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs",
              active
                ? cn(meta.pillActiveClass, "shadow-sm")
                : "text-ink-muted hover:text-ink",
              disabled && "cursor-not-allowed",
            )}
          >
            <span aria-hidden="true" className="mr-1">
              {meta.emoji}
            </span>
            {meta.shortLabel}
          </button>
        );
      })}
    </div>
  );
}
