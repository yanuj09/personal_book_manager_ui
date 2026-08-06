import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { BOOK_STATUS_META, type BookStatus } from "@/models/book.model";

export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** The one place a reading status turns into a coloured pill. */
export function StatusBadge({
  status,
  showEmoji = false,
  className,
}: {
  status: BookStatus;
  showEmoji?: boolean;
  className?: string;
}) {
  const meta = BOOK_STATUS_META[status];
  return (
    <Badge className={cn(meta.badgeClass, className)}>
      {showEmoji && <span aria-hidden="true">{meta.emoji}</span>}
      {meta.label}
    </Badge>
  );
}

export function TagBadge({
  tag,
  className,
}: {
  tag: string;
  className?: string;
}) {
  return (
    <Badge
      className={cn(
        "bg-surface-sunken text-ink-muted ring-1 ring-border-base",
        className,
      )}
    >
      {tag}
    </Badge>
  );
}
