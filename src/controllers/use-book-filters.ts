"use client";

import { useMemo, useState } from "react";
import {
  collectTags,
  compareBooks,
  type Book,
  type BookStatus,
  type SortOption,
} from "@/models/book.model";

export interface BookFilters {
  query: string;
  status: BookStatus | "all";
  tags: string[];
  sort: SortOption;
}

const INITIAL_FILTERS: BookFilters = {
  query: "",
  status: "all",
  tags: [],
  sort: "recent",
};

/**
 * Search, filter and sort over an already-loaded collection.
 *
 * Deliberately client-side: the list is a personal shelf, not a catalogue, so
 * filtering locally is instant and costs no round trip. If collections ever
 * grow past a few hundred books this moves to query params on `bookService`.
 */
export function useBookFilters(books: Book[]) {
  const [filters, setFilters] = useState<BookFilters>(INITIAL_FILTERS);

  const availableTags = useMemo(() => collectTags(books), [books]);

  const counts = useMemo(() => {
    const byStatus: Record<BookStatus, number> = {
      "want-to-read": 0,
      reading: 0,
      completed: 0,
    };
    for (const book of books) byStatus[book.status] += 1;
    return { total: books.length, byStatus };
  }, [books]);

  const visibleBooks = useMemo(() => {
    const needle = filters.query.trim().toLowerCase();

    const filtered = books.filter((book) => {
      if (filters.status !== "all" && book.status !== filters.status) {
        return false;
      }

      // Multiple tags narrow the list: a book must carry all of them.
      if (
        filters.tags.length > 0 &&
        !filters.tags.every((tag) => book.tags.includes(tag))
      ) {
        return false;
      }

      if (!needle) return true;
      return (
        book.title.toLowerCase().includes(needle) ||
        book.author.toLowerCase().includes(needle) ||
        book.tags.some((tag) => tag.toLowerCase().includes(needle))
      );
    });

    return filtered.sort(compareBooks(filters.sort));
  }, [books, filters]);

  const isFiltered =
    filters.query.trim() !== "" ||
    filters.status !== "all" ||
    filters.tags.length > 0;

  return {
    filters,
    visibleBooks,
    availableTags,
    counts,
    isFiltered,

    setQuery: (query: string) =>
      setFilters((current) => ({ ...current, query })),

    setStatus: (status: BookStatus | "all") =>
      setFilters((current) => ({ ...current, status })),

    setSort: (sort: SortOption) =>
      setFilters((current) => ({ ...current, sort })),

    toggleTag: (tag: string) =>
      setFilters((current) => ({
        ...current,
        tags: current.tags.includes(tag)
          ? current.tags.filter((existing) => existing !== tag)
          : [...current.tags, tag],
      })),

    reset: () => setFilters(INITIAL_FILTERS),
  };
}
