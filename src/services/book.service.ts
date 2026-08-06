/**
 * Book transport. See the note in `auth.service.ts` — same contract, two
 * interchangeable backends.
 */

import { usingMockBackend } from "@/lib/env";
import type { Book, BookDraft } from "@/models/book.model";
import { httpClient } from "./http-client";
import { mockBackend } from "./mock/mock-backend";

export const bookService = {
  list(): Promise<Book[]> {
    if (usingMockBackend) return mockBackend.listBooks();
    return httpClient.get<Book[]>("/api/books");
  },

  get(id: string): Promise<Book> {
    if (usingMockBackend) return mockBackend.getBook(id);
    return httpClient.get<Book>(`/api/books/${id}`);
  },

  create(draft: BookDraft): Promise<Book> {
    if (usingMockBackend) return mockBackend.createBook(draft);
    return httpClient.post<Book>("/api/books", { ...draft });
  },

  update(id: string, patch: Partial<BookDraft>): Promise<Book> {
    if (usingMockBackend) return mockBackend.updateBook(id, patch);
    return httpClient.patch<Book>(`/api/books/${id}`, { ...patch });
  },

  remove(id: string): Promise<void> {
    if (usingMockBackend) return mockBackend.deleteBook(id);
    return httpClient.delete<void>(`/api/books/${id}`);
  },
};
