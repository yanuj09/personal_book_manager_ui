"use client";

import Link from "next/link";
import { useBooks } from "@/controllers/books-controller";
import { useBookFilters } from "@/controllers/use-book-filters";
import { routes } from "@/lib/routes";
import { pluralize } from "@/lib/format";
import { PageHeader } from "@/components/layout/page-header";
import { BookCard } from "@/components/books/book-card";
import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingPanel } from "@/components/ui/spinner";
import { IconCollection, IconPlus, IconSearch } from "@/components/ui/icons";
import { FilterBar } from "./filter-bar";

export function CollectionView() {
  const { books, status, error, reload } = useBooks();
  const {
    filters,
    visibleBooks,
    availableTags,
    counts,
    isFiltered,
    setQuery,
    setStatus,
    setSort,
    toggleTag,
    reset,
  } = useBookFilters(books);

  if (status === "loading") return <LoadingPanel label="Opening your collection" />;

  if (status === "error") {
    return (
      <EmptyState
        title="We couldn't load your collection"
        description={error ?? undefined}
        action={
          <button
            type="button"
            onClick={() => void reload()}
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
            : `${visibleBooks.length} of ${books.length} ${pluralize(books.length, "book")}`
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
            onQueryChange={setQuery}
            onStatusChange={setStatus}
            onTagToggle={toggleTag}
            onSortChange={setSort}
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
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {visibleBooks.map((book) => (
                <li key={book.id} className="flex">
                  <BookCard book={book} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
}
