/**
 * Book domain model.
 *
 * Holds the shape of a book plus the rules that are true about books no matter
 * who is asking — status metadata, cover derivation, sorting and validation.
 * Controllers and views consume these; they never redefine them.
 */

export const BOOK_STATUSES = ["want-to-read", "reading", "completed"] as const;

export type BookStatus = (typeof BOOK_STATUSES)[number];

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  tags: string[];
  status: BookStatus;
  /** 0–100. Meaningful while `status === "reading"`. */
  progress: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

/** The fields a user actually fills in. Everything else is derived or stamped. */
export interface BookDraft {
  title: string;
  author: string;
  description: string;
  tags: string[];
  status: BookStatus;
  progress: number;
  notes: string;
}

export interface BookStatusMeta {
  value: BookStatus;
  label: string;
  /** Short form for dense UI like filter pills. */
  shortLabel: string;
  emoji: string;
  /** Tailwind classes for the badge in both themes. */
  badgeClass: string;
  /** Tailwind classes for the active state of a filter pill. */
  pillActiveClass: string;
}

export const BOOK_STATUS_META: Record<BookStatus, BookStatusMeta> = {
  "want-to-read": {
    value: "want-to-read",
    label: "Want to Read",
    shortLabel: "Want to Read",
    emoji: "📖",
    badgeClass: "bg-surface-sunken text-ink-muted ring-1 ring-border-base",
    pillActiveClass: "bg-ink text-canvas",
  },
  reading: {
    value: "reading",
    label: "Reading",
    shortLabel: "Reading",
    emoji: "📘",
    badgeClass: "bg-warning-soft text-warning ring-1 ring-warning/25",
    pillActiveClass: "bg-warning text-canvas",
  },
  completed: {
    value: "completed",
    label: "Completed",
    shortLabel: "Completed",
    emoji: "✅",
    badgeClass: "bg-success-soft text-success ring-1 ring-success/25",
    pillActiveClass: "bg-success text-canvas",
  },
};

export const BOOK_STATUS_LIST: BookStatusMeta[] = BOOK_STATUSES.map(
  (status) => BOOK_STATUS_META[status],
);

export function isBookStatus(value: unknown): value is BookStatus {
  return (
    typeof value === "string" && BOOK_STATUSES.includes(value as BookStatus)
  );
}

/** Tags we suggest up front. Users can still add their own. */
export const SUGGESTED_TAGS = [
  "Fiction",
  "Non-Fiction",
  "Sci-Fi",
  "Fantasy",
  "Mystery",
  "Thriller",
  "Biography",
  "History",
  "Philosophy",
  "Self-Help",
  "Poetry",
  "Classic",
] as const;

export function emptyBookDraft(): BookDraft {
  return {
    title: "",
    author: "",
    description: "",
    tags: [],
    status: "want-to-read",
    progress: 0,
    notes: "",
  };
}

export function toDraft(book: Book): BookDraft {
  return {
    title: book.title,
    author: book.author,
    description: book.description,
    tags: [...book.tags],
    status: book.status,
    progress: book.progress,
    notes: book.notes,
  };
}

/* -------------------------------------------------------------------------- */
/*  Derived presentation data                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Spine colours for the generated cover. Books have no cover upload, so we give
 * each one a stable colour derived from its title — the shelf still looks like
 * a shelf, and a given book always shows up the same way.
 */
const COVER_PALETTE = [
  { from: "#b8563a", to: "#93412a" }, // terracotta
  { from: "#2c5f5d", to: "#1f4544" }, // teal
  { from: "#1e3a5f", to: "#152a46" }, // navy
  { from: "#a9781f", to: "#835c14" }, // ochre
  { from: "#6b4a7a", to: "#503859" }, // plum
  { from: "#4a6741", to: "#374d31" }, // sage
  { from: "#8c3f52", to: "#6b2f3e" }, // wine
  { from: "#37566b", to: "#294050" }, // slate blue
];

export interface CoverPaint {
  from: string;
  to: string;
}

export function coverPaintFor(book: Pick<Book, "title" | "author">): CoverPaint {
  const seed = `${book.title}${book.author}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 100_000;
  }
  return COVER_PALETTE[hash % COVER_PALETTE.length];
}

/* -------------------------------------------------------------------------- */
/*  Domain rules                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Keeps progress and status honest with each other, so the UI can never show
 * "Completed, 40%". Applied on every create and update.
 */
export function reconcileProgress(draft: BookDraft): BookDraft {
  if (draft.status === "completed") return { ...draft, progress: 100 };
  if (draft.status === "want-to-read") return { ...draft, progress: 0 };
  return { ...draft, progress: clampProgress(draft.progress) };
}

export function clampProgress(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export const SORT_OPTIONS = [
  { value: "recent", label: "Recently updated" },
  { value: "title", label: "Title (A–Z)" },
  { value: "author", label: "Author (A–Z)" },
  { value: "progress", label: "Progress" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

export function compareBooks(sort: SortOption) {
  return (a: Book, b: Book): number => {
    switch (sort) {
      case "title":
        return a.title.localeCompare(b.title);
      case "author":
        return a.author.localeCompare(b.author);
      case "progress":
        return b.progress - a.progress;
      case "recent":
      default:
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    }
  };
}

/** Every distinct tag across a collection, alphabetised. */
export function collectTags(books: Book[]): string[] {
  const seen = new Set<string>();
  for (const book of books) {
    for (const tag of book.tags) seen.add(tag);
  }
  return [...seen].sort((a, b) => a.localeCompare(b));
}
