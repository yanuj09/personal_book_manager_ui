"use client";

import { useState, type FormEvent } from "react";
import { BOOK_STATUS_LIST, type BookStatus } from "@/models/book.model";
import { useBooks } from "@/controllers/books-controller";
import { useToast } from "@/providers/toast-provider";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { IconPlus } from "@/components/ui/icons";

const STATUS_OPTIONS = BOOK_STATUS_LIST.map((meta) => ({
  value: meta.value,
  label: meta.label,
}));

/**
 * Add a book without leaving the dashboard.
 *
 * Only the three fields you can't skip — title, author, status. Anything
 * richer belongs on the full form, which this links to.
 */
export function QuickAddCard() {
  const { createBook } = useBooks();
  const { notify } = useToast();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [status, setStatus] = useState<BookStatus>("want-to-read");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();

    if (!title.trim() || !author.trim()) {
      setError("A title and an author, and it's yours.");
      return;
    }

    setError(null);
    setSaving(true);
    try {
      await createBook({
        title: title.trim(),
        author: author.trim(),
        description: "",
        tags: [],
        status,
        progress: 0,
        notes: "",
      });
      notify(`“${title.trim()}” is on the shelf.`, "success");
      setTitle("");
      setAuthor("");
      setStatus("want-to-read");
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Couldn't add that book.";
      setError(message);
      notify(message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader
        title="Quick add"
        description="Something you just picked up?"
      />

      <form onSubmit={onSubmit} noValidate className="mt-4 space-y-3">
        <Input
          label="Title"
          placeholder="The Midnight Library"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <Input
          label="Author"
          placeholder="Matt Haig"
          value={author}
          onChange={(event) => setAuthor(event.target.value)}
          error={error ?? undefined}
        />
        <Select
          label="Status"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(event) => setStatus(event.target.value as BookStatus)}
        />
        <Button
          type="submit"
          fullWidth
          loading={saving}
          icon={<IconPlus className="text-base" />}
        >
          Add to collection
        </Button>
      </form>
    </Card>
  );
}
