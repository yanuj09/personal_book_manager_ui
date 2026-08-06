"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BOOK_STATUS_LIST,
  compareBooks,
  type Book,
  type BookStatus,
  type SortOption,
} from "@/models/book.model";
import { routes } from "@/lib/routes";
import { pluralize } from "@/lib/format";
import { bookService } from "@/services/book.service";
import { PageHeader } from "@/components/layout/page-header";
import { BookCard } from "@/components/books/book-card";
import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingPanel } from "@/components/ui/spinner";
import { IconCollection, IconPlus, IconSearch } from "@/components/ui/icons";
import { FilterBar } from "./filter-bar";

const PAGE_SIZE = 20;
const PAGINATION_WINDOW = 5;

type PaginationItem = number | "ellipsis-left" | "ellipsis-right";

interface FiltersState {
  query: string;
  status: BookStatus | "all";
  tags: string[];
  sort: SortOption;
}

const INITIAL_FILTERS: FiltersState = {
  query: "",
  status: "all",
  tags: [],
  sort: "recent",
};

export function CollectionView() {
  const pathname = usePathname();
  const [filters, setFilters] = useState<FiltersState>(INITIAL_FILTERS);
  const [books, setBooks] = useState<Book[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  const debouncedQuery = useDebouncedValue(filters.query, 300);

  useEffect(() => {
    if (pathname !== routes.collection) return;

    let cancelled = false;

    async function load() {
      setStatus("loading");
      setError(null);

      try {
        const response = await bookService.listQuery({
          status: filters.status === "all" ? undefined : filters.status,
          tag: filters.tags[0],
          search: debouncedQuery.trim() || undefined,
          page,
          limit: PAGE_SIZE,
        });

        if (cancelled) return;

        setBooks(response.books);
        setPagination(response.pagination ?? null);
        setStatus("ready");
      } catch (caught) {
        if (cancelled) return;
        setError(caught instanceof Error ? caught.message : "Failed to load books.");
        setStatus("error");
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [pathname, filters.status, filters.tags, debouncedQuery, page, reloadTick]);

  const visibleBooks = useMemo(
    () => [...books].sort(compareBooks(filters.sort)),
    [books, filters.sort],
  );

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    for (const book of books) {
      for (const tag of book.tags) tags.add(tag);
    }
    return [...tags].sort((a, b) => a.localeCompare(b));
  }, [books]);

  const counts = useMemo(() => {
    const byStatus: Record<BookStatus, number> = {
      "want-to-read": 0,
      reading: 0,
      completed: 0,
    };
    for (const book of books) byStatus[book.status] += 1;
    return { total: books.length, byStatus };
  }, [books]);

  const isFiltered =
    filters.query.trim() !== "" ||
    filters.status !== "all" ||
    filters.tags.length > 0;

  const shouldShowPagination =
    pagination !== null &&
    pagination.total > pagination.limit &&
    pagination.totalPages > 1;

  const pageButtons = useMemo(() => {
    if (!pagination || pagination.totalPages <= 1) return [] as PaginationItem[];

    const totalPages = pagination.totalPages;
    const currentPage = pagination.page;

    if (totalPages <= PAGINATION_WINDOW + 2) {
      const allPages: PaginationItem[] = [];
      for (let nextPage = 1; nextPage <= totalPages; nextPage += 1) {
        allPages.push(nextPage);
      }
      return allPages;
    }

    const half = Math.floor(PAGINATION_WINDOW / 2);
    let start = Math.max(2, currentPage - half);
    let end = Math.min(totalPages - 1, start + PAGINATION_WINDOW - 1);
    start = Math.max(2, end - PAGINATION_WINDOW + 1);

    const items: PaginationItem[] = [1];

    if (start > 2) {
      items.push("ellipsis-left");
    }

    for (let nextPage = start; nextPage <= end; nextPage += 1) {
      items.push(nextPage);
    }

    if (end < totalPages - 1) {
      items.push("ellipsis-right");
    }

    items.push(totalPages);
    return items;
  }, [pagination]);

  function reset() {
    setFilters(INITIAL_FILTERS);
    setPage(1);
  }

  function reload() {
    setReloadTick((current) => current + 1);
  }

  if (status === "loading") return <LoadingPanel label="Opening your collection" />;

  if (status === "error") {
    return (
      <EmptyState
        title="We couldn't load your collection"
        description={error ?? undefined}
        action={
          <button
            type="button"
            onClick={reload}
            className={buttonStyles("secondary", "sm")}
          >
            Try again
          </button>
        }
      />
    );
  }

  // An empty shelf and an over-filtered shelf are different problems, so they
  // get different messages.
  const shelfIsEmpty = books.length === 0;

  return (
    <>
      <PageHeader
        title="My collection"
        description={
          shelfIsEmpty
            ? "Nothing here yet."
            : pagination
              ? `${pagination.total} ${pluralize(pagination.total, "book")} total`
              : `${books.length} ${pluralize(books.length, "book")}`
        }
        action={
          <Link href={routes.newBook} className={buttonStyles("primary", "md")}>
            <IconPlus className="text-base" />
            Add a book
          </Link>
        }
      />

      {shelfIsEmpty ? (
        <EmptyState
          icon={<IconCollection />}
          title="Your shelf is waiting"
          description="Add the book on your nightstand and everything else follows from there."
          action={
            <Link href={routes.newBook} className={buttonStyles("primary", "sm")}>
              Add your first book
            </Link>
          }
        />
      ) : (
        <div className="space-y-6">
          <FilterBar
            query={filters.query}
            status={filters.status}
            activeTags={filters.tags}
            availableTags={availableTags}
            sort={filters.sort}
            counts={counts}
            isFiltered={isFiltered}
            onQueryChange={(query) => {
              setFilters((current) => ({ ...current, query }));
              setPage(1);
            }}
            onStatusChange={(statusValue) => {
              setFilters((current) => ({ ...current, status: statusValue }));
              setPage(1);
            }}
            onTagToggle={(tag) => {
              setFilters((current) => ({
                ...current,
                tags: current.tags.includes(tag)
                  ? current.tags.filter((existing) => existing !== tag)
                  : [tag],
              }));
              setPage(1);
            }}
            onSortChange={(sort) =>
              setFilters((current) => ({ ...current, sort }))
            }
            onReset={reset}
          />

          {visibleBooks.length === 0 ? (
            <EmptyState
              icon={<IconSearch />}
              title="No books match those filters"
              description="Try a different status, or clear the filters to see everything."
              action={
                <button
                  type="button"
                  onClick={reset}
                  className={buttonStyles("secondary", "sm")}
                >
                  Clear filters
                </button>
              }
            />
          ) : (
            <>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {visibleBooks.map((book) => (
                  <li key={book.id} className="flex">
                    <BookCard book={book} />
                  </li>
                ))}
              </ul>

              {shouldShowPagination && pagination && (
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    className={buttonStyles("secondary", "sm")}
                    disabled={pagination.page <= 1}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-2">
                    {pageButtons.map((pageNumber, index) => {
                      if (typeof pageNumber !== "number") {
                        return (
                          <span
                            key={`${pageNumber}-${index}`}
                            className="px-1 text-xs text-ink-subtle"
                            aria-hidden
                          >
                            ...
                          </span>
                        );
                      }

                      const isActive = pageNumber === pagination.page;
                      return (
                        <button
                          key={pageNumber}
                          type="button"
                          onClick={() => setPage(pageNumber)}
                          disabled={isActive}
                          className={buttonStyles(
                            isActive ? "primary" : "secondary",
                            "sm",
                          )}
                          aria-current={isActive ? "page" : undefined}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    className={buttonStyles("secondary", "sm")}
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() =>
                      setPage((current) =>
                        Math.min(pagination.totalPages, current + 1),
                      )
                    }
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
