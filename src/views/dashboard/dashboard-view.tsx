"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { BookStatus } from "@/models/book.model";
import { compareBooks } from "@/models/book.model";
import { useBooks } from "@/controllers/books-controller";
import { useReadingStats } from "@/controllers/use-reading-stats";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/providers/toast-provider";
import { routes } from "@/lib/routes";
import { pluralize } from "@/lib/format";
import type { DashboardSummary } from "@/services/book.service";
import { bookService } from "@/services/book.service";
import { PageHeader } from "@/components/layout/page-header";
import { BookRow } from "@/components/books/book-row";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingPanel } from "@/components/ui/spinner";
import {
  IconBookOpen,
  IconCheckCircle,
  IconPlus,
  IconSparkle,
  IconStack,
} from "@/components/ui/icons";
import { CurrentlyReading } from "./currently-reading";
import { QuickAddCard } from "./quick-add-card";
import { StatCard } from "./stat-card";

const RECENT_LIMIT = 8;

export function DashboardView() {
  const pathname = usePathname();
  const { books, status, error, reload, changeStatus } = useBooks();
  const stats = useReadingStats(books);
  const { user } = useAuth();
  const { notify } = useToast();
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);

  // Ids with a status change in flight, so their control locks while it saves.
  const [pending, setPending] = useState<string[]>([]);

  async function onStatusChange(id: string, next: BookStatus) {
    const previousSnapshot = dashboard?.books.find((book) => book.id === id);

    setDashboard((current) => {
      if (!current) return current;

      return {
        ...current,
        books: current.books.map((book) => {
          if (book.id !== id) return book;

          const nextProgress =
            next === "completed"
              ? 100
              : next === "want-to-read"
                ? 0
                : book.progress;

          return {
            ...book,
            status: next,
            progress: nextProgress,
            completedAt:
              next === "completed" ? new Date().toISOString() : null,
          };
        }),
      };
    });

    setPending((current) => [...current, id]);
    try {
      await changeStatus(id, next);
    } catch (caught) {
      if (previousSnapshot) {
        setDashboard((current) => {
          if (!current) return current;
          return {
            ...current,
            books: current.books.map((book) =>
              book.id === id ? previousSnapshot : book,
            ),
          };
        });
      }

      notify(
        caught instanceof Error ? caught.message : "Couldn't update that book.",
        "error",
      );
    } finally {
      setPending((current) => current.filter((pendingId) => pendingId !== id));
    }
  }

  useEffect(() => {
    if (pathname !== routes.dashboard) return;

    let cancelled = false;

    async function loadDashboard() {
      try {
        const next = await bookService.dashboard();
        if (cancelled) return;
        setDashboard(next);
      } catch {
        if (cancelled) return;
        setDashboard(null);
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const booksById = useMemo(
    () => new Map(books.map((book) => [book.id, book])),
    [books],
  );

  if (status === "loading") return <LoadingPanel label="Gathering your shelf" />;

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

  const firstName = user?.name?.trim().split(/\s+/)[0] ?? "reader";
  const recentBooks = dashboard
    ? dashboard.books
        .map((book) => booksById.get(book.id) ?? book)
        .slice(0, RECENT_LIMIT)
    : [...books].sort(compareBooks("recent")).slice(0, RECENT_LIMIT);
  const totalBooks = dashboard?.metrics.totalBooks ?? stats.total;
  const currentlyReading = dashboard?.metrics.currentlyReading ?? stats.reading;
  const completedBooks = dashboard?.metrics.completedBooks ?? stats.completed;

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description={
          books.length === 0
            ? "Your shelf is empty — let's fix that."
            : `${totalBooks} ${pluralize(totalBooks, "book")} on the shelf, ${currentlyReading} in progress.`
        }
        action={
          <Link
            href={routes.newBook}
            className={buttonStyles("primary", "md")}
          >
            <IconPlus className="text-base" />
            Add a book
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total books"
          value={totalBooks}
          icon={<IconStack />}
          footnote={
            stats.wantToRead > 0
              ? `${stats.wantToRead} waiting to be started`
              : undefined
          }
        />
        <StatCard
          label="Currently reading"
          value={currentlyReading}
          icon={<IconBookOpen />}
          accentClassName="bg-warning-soft text-warning"
          footnote={currentlyReading > 0 ? "Keep your streak going" : undefined}
        />
        <StatCard
          label="Completed"
          value={completedBooks}
          icon={<IconCheckCircle />}
          accentClassName="bg-success-soft text-success"
          footnote={completedBooks > 0 ? `${completedBooks} finished so far` : undefined}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Currently reading"
              description="Where your bookmarks are sitting."
            />
            <div className="mt-4">
              <CurrentlyReading books={stats.currentlyReading} />
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Recent activity"
              description="Change a status right here."
              action={
                books.length > RECENT_LIMIT ? (
                  <Link
                    href={routes.collection}
                    className="text-xs font-medium text-primary underline-offset-2 hover:underline"
                  >
                    See all {books.length}
                  </Link>
                ) : undefined
              }
            />

            <div className="mt-3">
              {recentBooks.length === 0 ? (
                <EmptyState
                  icon={<IconPlus />}
                  title="No books yet"
                  description="Add your first one and this page starts telling you things."
                  action={
                    <Link
                      href={routes.newBook}
                      className={buttonStyles("primary", "sm")}
                    >
                      Add a book
                    </Link>
                  }
                />
              ) : (
                <ul className="divide-y divide-border-base">
                  {recentBooks.map((book) => (
                    <BookRow
                      key={book.id}
                      book={book}
                      onStatusChange={onStatusChange}
                      busy={pending.includes(book.id)}
                    />
                  ))}
                </ul>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <QuickAddCard />

          {stats.favouriteAuthor && (
            <Card className="bg-primary-soft ring-primary/15">
              <div className="flex items-start gap-3">
                <IconSparkle className="mt-0.5 shrink-0 text-base text-primary" />
                <div>
                  <p className="text-xs font-medium tracking-wide text-primary/80">
                    You seem to like
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink">
                    {stats.favouriteAuthor.name}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {stats.favouriteAuthor.count}{" "}
                    {pluralize(stats.favouriteAuthor.count, "book")} on your
                    shelf.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {stats.recentlyCompleted.length > 0 && (
            <Card>
              <CardHeader title="Recently finished" />
              <ul className="mt-3 space-y-2.5">
                {stats.recentlyCompleted.map((book) => (
                  <li key={book.id}>
                    <Link
                      href={routes.book(book.id)}
                      className="group block min-w-0"
                    >
                      <p className="truncate text-sm text-ink group-hover:text-primary">
                        {book.title}
                      </p>
                      <p className="truncate text-xs text-ink-subtle">
                        {book.author}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
