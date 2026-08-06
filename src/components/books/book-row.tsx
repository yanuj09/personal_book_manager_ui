"use client";

import Link from "next/link";
import type { Book, BookStatus } from "@/models/book.model";
import { routes } from "@/lib/routes";
import { formatRelative } from "@/lib/format";
import { ProgressBar } from "@/components/ui/progress-bar";
import { BookCover } from "./book-cover";
import { StatusControl } from "./status-control";

interface BookRowProps {
  book: Book;
  onStatusChange: (id: string, status: BookStatus) => void;
  busy?: boolean;
}

/**
 * Dense list row with the status control inline.
 *
 * This is the dashboard's answer to "mark them as read, reading or completed" —
 * the whole shelf is changeable without leaving the page.
 */
export function BookRow({ book, onStatusChange, busy = false }: BookRowProps) {
  return (
    <li className="flex flex-col gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-surface-sunken/60 sm:flex-row sm:items-center sm:gap-4">
      <Link
        href={routes.book(book.id)}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <BookCover book={book} size="sm" className="w-10 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{book.title}</p>
          <p className="truncate text-xs text-ink-muted">
            {book.author}
            <span className="text-ink-subtle">
              {" · updated "}
              {formatRelative(book.updatedAt)}
            </span>
          </p>
          {book.status === "reading" && (
            <ProgressBar
              value={book.progress}
              showValue
              className="mt-1.5 max-w-56"
            />
          )}
        </div>
      </Link>

      <StatusControl
        value={book.status}
        onChange={(status) => onStatusChange(book.id, status)}
        size="sm"
        disabled={busy}
        className="shrink-0 self-start sm:self-center"
      />
    </li>
  );
}
