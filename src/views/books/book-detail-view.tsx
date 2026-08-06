"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBooks } from "@/controllers/books-controller";
import { routes } from "@/lib/routes";
import { formatDate, formatRelative } from "@/lib/format";
import { useToast } from "@/providers/toast-provider";
import { PageHeader } from "@/components/layout/page-header";
import { BookCover } from "@/components/books/book-cover";
import { StatusControl } from "@/components/books/status-control";
import { Button, buttonStyles } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ProgressBar } from "@/components/ui/progress-bar";
import { LoadingPanel } from "@/components/ui/spinner";
import { StatusBadge, TagBadge } from "@/components/ui/badge";
import { IconChevronLeft, IconPencil, IconTrash } from "@/components/ui/icons";

export function BookDetailView({ id }: { id: string }) {
  const router = useRouter();
  const { notify } = useToast();
  const { status, error, reload, findBook, changeStatus, deleteBook } = useBooks();

  const [savingStatus, setSavingStatus] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (status === "loading") {
    return <LoadingPanel label="Loading book" />;
  }

  if (status === "error") {
    return (
      <EmptyState
        title="We could not load this book"
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

  const book = findBook(id);
  if (!book) {
    return (
      <EmptyState
        title="Book not found"
        description="It may have been removed from your shelf."
        action={
          <Link href={routes.collection} className={buttonStyles("secondary", "sm")}>
            Back to collection
          </Link>
        }
      />
    );
  }

  const currentBook = book;

  async function onStatusChange(next: typeof currentBook.status) {
    if (next === currentBook.status) return;

    setSavingStatus(true);
    try {
      await changeStatus(currentBook.id, next);
      notify("Status updated.", "success");
    } catch (caught) {
      notify(
        caught instanceof Error ? caught.message : "Could not update status.",
        "error",
      );
    } finally {
      setSavingStatus(false);
    }
  }

  async function onDelete() {
    setDeleting(true);
    try {
      await deleteBook(currentBook.id);
      notify("Book deleted.", "success");
      router.replace(routes.collection);
    } catch (caught) {
      notify(
        caught instanceof Error ? caught.message : "Could not delete that book.",
        "error",
      );
      setDeleting(false);
      setConfirmDeleteOpen(false);
    }
  }

  return (
    <>
      <PageHeader
        title={currentBook.title}
        description={currentBook.author}
        eyebrow={
          <Link
            href={routes.collection}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted transition-colors hover:text-ink"
          >
            <IconChevronLeft className="text-sm" />
            Back to collection
          </Link>
        }
        action={
          <div className="flex gap-2">
            <Link href={routes.editBook(currentBook.id)} className={buttonStyles("secondary", "sm")}>
              <IconPencil className="text-sm" />
              Edit
            </Link>
            <Button
              variant="danger-soft"
              size="sm"
              icon={<IconTrash className="text-sm" />}
              onClick={() => setConfirmDeleteOpen(true)}
            >
              Delete
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[13rem_minmax(0,1fr)_16rem]">
        <Card className="h-fit">
          <BookCover book={currentBook} size="lg" />
          <div className="mt-3 flex flex-wrap gap-1.5">
            <StatusBadge status={currentBook.status} showEmoji />
            {currentBook.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Description" />
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              {currentBook.description || "No description yet."}
            </p>
          </Card>

          <Card>
            <CardHeader title="Notes" />
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-muted">
              {currentBook.notes || "No notes yet."}
            </p>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Reading status" />
            <div className="mt-3 space-y-3">
              <StatusControl
                value={currentBook.status}
                onChange={onStatusChange}
                disabled={savingStatus}
              />
              {currentBook.status === "reading" && (
                <ProgressBar value={currentBook.progress} showValue />
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Timeline" />
            <dl className="mt-3 space-y-2.5 text-xs">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-subtle">Created</dt>
                <dd className="text-ink-muted">{formatDate(currentBook.createdAt)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-subtle">Updated</dt>
                <dd className="text-ink-muted">{formatRelative(currentBook.updatedAt)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-subtle">Completed</dt>
                <dd className="text-ink-muted">{formatDate(currentBook.completedAt)}</dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete this book?"
        description="This removes it from your collection and cannot be undone."
        confirmLabel="Delete book"
        destructive
        loading={deleting}
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={() => void onDelete()}
      />
    </>
  );
}
