import Link from "next/link";
import type { Book } from "@/models/book.model";
import { routes } from "@/lib/routes";
import { StatusBadge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { BookCover } from "./book-cover";

/** Grid tile used across the collection. The whole card is one link target. */
export function BookCard({ book }: { book: Book }) {
  return (
    <Link
      href={routes.book(book.id)}
      className="group flex h-full w-full flex-col gap-2.5 rounded-xl p-2 transition-colors hover:bg-surface focus-visible:bg-surface"
    >
      <BookCover
        book={book}
        className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md"
      />

      <div className="space-y-1 px-0.5">
        <p className="line-clamp-2 text-sm font-medium leading-snug text-ink">
          {book.title}
        </p>
        <p className="truncate text-xs text-ink-muted">{book.author}</p>
      </div>

      <div className="mt-auto space-y-2 px-0.5 pb-0.5">
        <StatusBadge status={book.status} />
        {book.status === "reading" && (
          <ProgressBar value={book.progress} showValue />
        )}
      </div>
    </Link>
  );
}
