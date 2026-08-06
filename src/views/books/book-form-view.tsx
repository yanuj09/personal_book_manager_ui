"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBooks } from "@/controllers/books-controller";
import { useBookForm } from "@/controllers/use-book-form";
import {
  BOOK_STATUS_LIST,
  toDraft,
  type BookDraft,
  type BookStatus,
} from "@/models/book.model";
import { LIMITS } from "@/models/validation";
import { routes } from "@/lib/routes";
import { useToast } from "@/providers/toast-provider";
import { PageHeader } from "@/components/layout/page-header";
import { Button, buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { LoadingPanel } from "@/components/ui/spinner";
import { Select } from "@/components/ui/select";
import { TagInput } from "@/components/ui/tag-input";
import { Textarea } from "@/components/ui/textarea";
import { IconAlert, IconChevronLeft } from "@/components/ui/icons";
import { ProgressField } from "./progress-field";

const STATUS_OPTIONS = BOOK_STATUS_LIST.map((meta) => ({
  value: meta.value,
  label: `${meta.emoji} ${meta.label}`,
}));

interface FormScaffoldProps {
  title: string;
  description: string;
  submitLabel: string;
  initial?: BookDraft;
  onSubmit: (draft: BookDraft) => Promise<void>;
}

function FormScaffold({
  title,
  description,
  submitLabel,
  initial,
  onSubmit,
}: FormScaffoldProps) {
  const { draft, errors, formError, submitting, isDirty, setField, submit } =
    useBookForm({ initial, onSubmit });

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        eyebrow={
          <Link
            href={routes.collection}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted transition-colors hover:text-ink"
          >
            <IconChevronLeft className="text-sm" />
            Back to collection
          </Link>
        }
      />

      <Card>
        <form onSubmit={submit} noValidate className="space-y-4">
          {formError && (
            <div className="flex items-start gap-2 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger ring-1 ring-danger/25">
              <IconAlert className="mt-0.5 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Title"
              required
              value={draft.title}
              error={errors.title}
              onChange={(event) => setField("title", event.target.value)}
            />
            <Input
              label="Author"
              required
              value={draft.author}
              error={errors.author}
              onChange={(event) => setField("author", event.target.value)}
            />
          </div>

          <Textarea
            label="Description"
            value={draft.description}
            error={errors.description}
            maxCount={LIMITS.descriptionMax}
            rows={4}
            onChange={(event) => setField("description", event.target.value)}
          />

          <TagInput
            label="Tags"
            value={draft.tags}
            error={errors.tags}
            max={LIMITS.tagsMax}
            onChange={(value) => setField("tags", value)}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Status"
              value={draft.status}
              options={STATUS_OPTIONS}
              onChange={(event) =>
                setField("status", event.target.value as BookStatus)
              }
            />

            {draft.status === "reading" ? (
              <ProgressField
                value={draft.progress}
                error={errors.progress}
                onChange={(value) => setField("progress", value)}
              />
            ) : (
              <Input
                label="Progress"
                value={
                  draft.status === "completed"
                    ? "100%"
                    : draft.status === "want-to-read"
                      ? "0%"
                      : `${draft.progress}%`
                }
                disabled
              />
            )}
          </div>

          <Textarea
            label="Notes"
            value={draft.notes}
            error={errors.notes}
            maxCount={LIMITS.notesMax}
            rows={6}
            onChange={(event) => setField("notes", event.target.value)}
          />

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <Link href={routes.collection} className={buttonStyles("secondary", "md")}>
              Cancel
            </Link>
            <Button
              type="submit"
              loading={submitting}
              disabled={!isDirty}
            >
              {submitLabel}
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}

export function CreateBookView() {
  const router = useRouter();
  const { notify } = useToast();
  const { createBook } = useBooks();

  async function onCreate(draft: BookDraft) {
    const created = await createBook(draft);
    notify(`Added \"${created.title}\" to your collection.`, "success");
    router.replace(routes.book(created.id));
  }

  return (
    <FormScaffold
      title="Add New Book"
      description="Capture title, status, tags, and your first notes."
      submitLabel="Save to collection"
      onSubmit={onCreate}
    />
  );
}

export function EditBookView({ id }: { id: string }) {
  const router = useRouter();
  const { notify } = useToast();
  const { status, findBook, updateBook } = useBooks();

  if (status === "loading") {
    return <LoadingPanel label="Loading book" />;
  }

  const book = findBook(id);
  if (!book) {
    return (
      <EmptyState
        title="Book not found"
        description="It may have been deleted from your collection."
        action={
          <Link href={routes.collection} className={buttonStyles("secondary", "sm")}>
            Back to collection
          </Link>
        }
      />
    );
  }

  async function onUpdate(draft: BookDraft) {
    await updateBook(id, draft);
    notify("Book updated.", "success");
    router.replace(routes.book(id));
  }

  return (
    <FormScaffold
      title={`Edit: ${book.title}`}
      description="Update details, status, and notes."
      submitLabel="Save changes"
      initial={toDraft(book)}
      onSubmit={onUpdate}
    />
  );
}
