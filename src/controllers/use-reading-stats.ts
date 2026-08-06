"use client";

import { useMemo } from "react";
import type { Book } from "@/models/book.model";

export interface ReadingStats {
  total: number;
  reading: number;
  completed: number;
  wantToRead: number;
  /** Share of the collection finished, 0–100. */
  completionRate: number;
  /** Mean progress across books currently being read, 0–100. */
  averageProgress: number;
  currentlyReading: Book[];
  recentlyCompleted: Book[];
  /** The author with the most books on the shelf, if there's a clear one. */
  favouriteAuthor: { name: string; count: number } | null;
}

/**
 * Everything the dashboard reports, derived in one pass.
 *
 * Stats are computed rather than stored: nothing can drift out of sync with the
 * collection, because there is no second copy of the truth.
 */
export function useReadingStats(books: Book[]): ReadingStats {
  return useMemo(() => {
    const reading = books.filter((book) => book.status === "reading");
    const completed = books.filter((book) => book.status === "completed");
    const wantToRead = books.filter((book) => book.status === "want-to-read");

    const averageProgress =
      reading.length === 0
        ? 0
        : Math.round(
            reading.reduce((sum, book) => sum + book.progress, 0) /
              reading.length,
          );

    const byAuthor = new Map<string, number>();
    for (const book of books) {
      const key = book.author.trim();
      if (key) byAuthor.set(key, (byAuthor.get(key) ?? 0) + 1);
    }

    let favouriteAuthor: ReadingStats["favouriteAuthor"] = null;
    for (const [name, count] of byAuthor) {
      // Two books by the same author is the smallest signal worth reporting.
      if (count >= 2 && (!favouriteAuthor || count > favouriteAuthor.count)) {
        favouriteAuthor = { name, count };
      }
    }

    return {
      total: books.length,
      reading: reading.length,
      completed: completed.length,
      wantToRead: wantToRead.length,
      completionRate:
        books.length === 0
          ? 0
          : Math.round((completed.length / books.length) * 100),
      averageProgress,
      currentlyReading: [...reading].sort((a, b) => b.progress - a.progress),
      recentlyCompleted: [...completed]
        .sort(
          (a, b) =>
            new Date(b.completedAt ?? b.updatedAt).getTime() -
            new Date(a.completedAt ?? a.updatedAt).getTime(),
        )
        .slice(0, 4),
      favouriteAuthor,
    };
  }, [books]);
}
