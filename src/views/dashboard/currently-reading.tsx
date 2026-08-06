import Link from "next/link";
import type { Book } from "@/models/book.model";
import { routes } from "@/lib/routes";
import { BookCover } from "@/components/books/book-cover";
import { ProgressBar } from "@/components/ui/progress-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonStyles } from "@/components/ui/button";
import { IconBookOpen } from "@/components/ui/icons";

/**
 * The books in flight, as a horizontal rail.
 *
 * Scrolls sideways on narrow screens rather than reflowing into a tall stack —
 * "what am I in the middle of" should stay a single glance.
 */
export function CurrentlyReading({ books }: { books: Book[] }) {
  if (books.length === 0) {
    return (
      <EmptyState
        icon={<IconBookOpen />}
        title="Nothing open right now"
        description="Move a book to Reading and it'll show up here with its progress."
        action={
          <Link href={routes.collection} className={buttonStyles("secondary", "sm")}>
            Browse your collection
          </Link>
        }
      />
    );
  }

  return (
    <ul className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2 scrollbar-slim">
      {books.map((book) => (
        <li key={book.id} className="w-32 shrink-0 snap-start sm:w-36">
          <Link href={routes.book(book.id)} className="group block space-y-2">
            <BookCover
              book={book}
              className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md"
            />
            <div className="space-y-1">
              <p className="line-clamp-2 text-xs font-medium leading-snug text-ink">
                {book.title}
              </p>
              <p className="truncate text-[11px] text-ink-muted">
                {book.author}
              </p>
              <ProgressBar value={book.progress} showValue />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
