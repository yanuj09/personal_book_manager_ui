/**
 * Book transport. See the note in `auth.service.ts` — same contract, two
 * interchangeable backends.
 */

import { usingMockBackend } from "@/lib/env";
import type { Book, BookDraft } from "@/models/book.model";
import { httpClient } from "./http-client";
import { mockBackend } from "./mock/mock-backend";

type ApiBookStatus = "want_to_read" | "reading" | "completed";

interface ApiBook {
  _id?: string;
  id?: string;
  title: string;
  author: string;
  description?: string;
  tags?: string[];
  status?: ApiBookStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ListBooksResponse {
  books: ApiBook[];
}

interface BookEnvelope {
  book: ApiBook;
}

function toUiStatus(status: ApiBookStatus | undefined): Book["status"] {
  if (status === "want_to_read") return "want-to-read";
  if (status === "completed") return "completed";
  return "reading";
}

function toApiStatus(status: Book["status"]): ApiBookStatus {
  if (status === "want-to-read") return "want_to_read";
  if (status === "completed") return "completed";
  return "reading";
}

function toUiBook(book: ApiBook): Book {
  const status = toUiStatus(book.status);
  return {
    id: book._id ?? book.id ?? "",
    title: book.title,
    author: book.author,
    description: book.description ?? "",
    tags: book.tags ?? [],
    status,
    progress: status === "completed" ? 100 : status === "want-to-read" ? 0 : 0,
    notes: book.notes ?? "",
    createdAt: book.createdAt ?? new Date().toISOString(),
    updatedAt: book.updatedAt ?? new Date().toISOString(),
    completedAt: status === "completed" ? book.updatedAt ?? null : null,
  };
}

function toCreatePayload(draft: BookDraft) {
  return {
    title: draft.title,
    author: draft.author,
    description: draft.description,
    notes: draft.notes,
    tags: draft.tags,
    status: toApiStatus(draft.status),
  };
}

function toUpdatePayload(patch: Partial<BookDraft>) {
  const payload: Record<string, unknown> = {};
  if (patch.title !== undefined) payload.title = patch.title;
  if (patch.author !== undefined) payload.author = patch.author;
  if (patch.description !== undefined) payload.description = patch.description;
  if (patch.notes !== undefined) payload.notes = patch.notes;
  if (patch.tags !== undefined) payload.tags = patch.tags;
  if (patch.status !== undefined) payload.status = toApiStatus(patch.status);
  return payload;
}

export const bookService = {
  async list(): Promise<Book[]> {
    if (usingMockBackend) return mockBackend.listBooks();
    const response = await httpClient.get<ListBooksResponse | ApiBook[]>("/books");
    const books = Array.isArray(response) ? response : response.books;
    return books.map(toUiBook);
  },

  async get(id: string): Promise<Book> {
    if (usingMockBackend) return mockBackend.getBook(id);
    const response = await httpClient.get<BookEnvelope | ApiBook>(`/books/${id}`);
    const book = "book" in response ? response.book : response;
    return toUiBook(book);
  },

  async create(draft: BookDraft): Promise<Book> {
    if (usingMockBackend) return mockBackend.createBook(draft);
    const response = await httpClient.post<BookEnvelope | ApiBook>(
      "/books",
      toCreatePayload(draft),
    );
    const book = "book" in response ? response.book : response;
    return toUiBook(book);
  },

  async update(id: string, patch: Partial<BookDraft>): Promise<Book> {
    if (usingMockBackend) return mockBackend.updateBook(id, patch);
    const response = await httpClient.patch<BookEnvelope | ApiBook>(
      `/books/${id}`,
      toUpdatePayload(patch),
    );
    const book = "book" in response ? response.book : response;
    return toUiBook(book);
  },

  remove(id: string): Promise<void> {
    if (usingMockBackend) return mockBackend.deleteBook(id);
    return httpClient.delete<void>(`/books/${id}`);
  },
};
