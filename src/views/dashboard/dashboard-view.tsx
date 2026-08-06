"use client";

import { useState } from "react";
import Link from "next/link";
import type { BookStatus } from "@/models/book.model";
import { compareBooks } from "@/models/book.model";
import { useBooks } from "@/controllers/books-controller";
import { useReadingStats } from "@/controllers/use-reading-stats";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/providers/toast-provider";
import { routes } from "@/lib/routes";
import { pluralize } from "@/lib/format";
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
  const { books, status, error, reload, changeStatus } = useBooks();
  const stats = useReadingStats(books);
  const { user } = useAuth();
  const { notify } = useToast();

  // Ids with a status change in flight, so their control locks while it saves.
  const [pending, setPending] = useState<string[]>([]);

  async function onStatusChange(id: string, next: BookStatus) {
    setPending((current) => [...current, id]);
    try {
      await changeStatus(id, next);
    } catch (caught) {
      notify(
        caught instanceof Error ? caught.message : "Couldn't update that book.",
        "error",
      );
    } finally {
      setPending((current) => current.filter((pendingId) => pendingId !== id));
    }
  }

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
  const recentBooks = [...books].sort(compareBooks("recent")).slice(0, RECENT_LIMIT);

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description={
          books.length === 0
            ? "Your shelf is empty — let's fix that."
            : `${books.length} ${pluralize(books.length, "book")} on the shelf, ${stats.reading} in progress.`
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
          value={stats.total}
          icon={<IconStack />}
          footnote={
            stats.wantToRead > 0
              ? `${stats.wantToRead} waiting to be started`
              : undefined
          }
        />
        <StatCard
          label="Currently reading"
          value={stats.reading}
          icon={<IconBookOpen />}
          accentClassName="bg-warning-soft text-warning"
          footnote={
            stats.reading > 0
              ? `${stats.averageProgress}% average progress`
              : undefined
          }
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon={<IconCheckCircle />}
          accentClassName="bg-success-soft text-success"
          footnote={
            stats.total > 0
              ? `${stats.completionRate}% of your collection`
              : undefined
          }
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
