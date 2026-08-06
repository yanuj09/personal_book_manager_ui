import { cn } from "@/lib/cn";
import { coverPaintFor, type Book } from "@/models/book.model";

interface BookCoverProps {
  book: Pick<Book, "title" | "author">;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_STYLES = {
  sm: "text-[10px] p-2 rounded-md",
  md: "text-xs p-3 rounded-lg",
  lg: "text-sm p-4 rounded-xl",
} as const;

/**
 * A generated cover.
 *
 * There is no cover upload, so rather than show ten identical grey rectangles
 * we paint each book a stable colour derived from its title and set the title
 * itself. A shelf of these reads like a shelf.
 */
export function BookCover({ book, size = "md", className }: BookCoverProps) {
  const paint = coverPaintFor(book);

  return (
    <div
      className={cn(
        "relative flex aspect-3/4 flex-col justify-between overflow-hidden shadow-sm",
        SIZE_STYLES[size],
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(150deg, ${paint.from} 0%, ${paint.to} 100%)`,
      }}
    >
      {/* The spine: a darker band down the left edge. */}
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-[6%] bg-black/20"
      />
      {/* A soft sheen so flat colour doesn't read as a plain div. */}
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-br from-white/12 via-transparent to-black/15"
      />

      <p className="relative line-clamp-4 pl-[8%] font-semibold leading-tight text-white/95">
        {book.title}
      </p>
      <p className="relative truncate pl-[8%] text-[0.85em] text-white/70">
        {book.author}
      </p>
    </div>
  );
}
