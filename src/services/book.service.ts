/**
 * Book transport. See the note in `auth.service.ts` — same contract, two
 * interchangeable backends.
 */

import { usingMockBackend } from "@/lib/env";
import type { Book, BookDraft } from "@/models/book.model";
import { httpClient } from "@/services/http-client";
import { mockBackend } from "./mock/mock-backend";

type ApiBookStatus = "want_to_read" | "reading" | "completed";

interface ApiBook {
  _id: string;
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
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface BookEnvelope {
  book: ApiBook;
}

interface DashboardResponse {
  metrics: {
    totalBooks: number;
    currentlyReading: number;
    completedBooks: number;
  };
  books: ApiBook[];
}

export interface DashboardSummary {
  metrics: {
    totalBooks: number;
    currentlyReading: number;
    completedBooks: number;
  };
  books: Book[];
}

export interface BookListQuery {
  status?: Book["status"];
  tag?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface BookListResult {
  books: Book[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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
    // In real API mode, id must come from MongoDB _id only.
    id: book._id,
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

function toListQuery(query: BookListQuery) {
  const params = new URLSearchParams();
  if (query.status) params.set("status", toApiStatus(query.status));
  if (query.tag) params.set("tag", query.tag);
  if (query.search) params.set("search", query.search);
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  const encoded = params.toString();
  return encoded ? `?${encoded}` : "";
}

export const bookService = {
  async list(): Promise<Book[]> {
    if (usingMockBackend) return mockBackend.listBooks();
    const response = await httpClient.get<ListBooksResponse | ApiBook[]>("/books");
    const books = Array.isArray(response) ? response : response.books;
    return books.map(toUiBook);
  },

  async listQuery(query: BookListQuery): Promise<BookListResult> {
    if (usingMockBackend) {
      const books = await mockBackend.listBooks();
      return { books };
    }

    const response = await httpClient.get<ListBooksResponse | ApiBook[]>(
      `/books${toListQuery(query)}`,
    );

    if (Array.isArray(response)) {
      return { books: response.map(toUiBook) };
    }

    return {
      books: response.books.map(toUiBook),
      pagination: response.pagination,
    };
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

  async dashboard(): Promise<DashboardSummary> {
    if (usingMockBackend) {
      const books = await mockBackend.listBooks();
      const recentBooks = [...books]
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        )
        .slice(0, 12);

      return {
        metrics: {
          totalBooks: books.length,
          currentlyReading: books.filter((book) => book.status === "reading")
            .length,
          completedBooks: books.filter((book) => book.status === "completed")
            .length,
        },
        books: recentBooks,
      };
    }

    const response = await httpClient.get<DashboardResponse>("/books/dashboard");
    return {
      metrics: response.metrics,
      books: response.books.map(toUiBook),
    };
  },
};
