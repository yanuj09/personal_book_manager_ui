"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Book, BookDraft, BookStatus } from "@/models/book.model";
import { toApiError } from "@/services/api-error";
import { bookService } from "@/services/book.service";
import { useAuth } from "@/providers/auth-provider";

export type CollectionStatus = "loading" | "ready" | "error";

interface BooksContextValue {
  books: Book[];
  status: CollectionStatus;
  error: string | null;
  reload: () => Promise<void>;
  findBook: (id: string) => Book | undefined;
  createBook: (draft: BookDraft) => Promise<Book>;
  updateBook: (id: string, patch: Partial<BookDraft>) => Promise<Book>;
  /** Optimistic — the pill flips instantly and rolls back if the save fails. */
  changeStatus: (id: string, status: BookStatus) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
}

const BooksContext = createContext<BooksContextValue | null>(null);

/**
 * Owns the user's collection for the whole authenticated area.
 *
 * Mounted once in the app layout so the dashboard, the collection grid and a
 * book's detail page all read the same list — switching between them costs no
 * request, and an edit made in one place is visible in the others immediately.
 */
export function BooksProvider({ children }: { children: ReactNode }) {
  const { status: authStatus } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [status, setStatus] = useState<CollectionStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      setBooks(await bookService.list());
      setStatus("ready");
    } catch (caught) {
      setError(toApiError(caught).message);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (authStatus === "authenticated") {
      void load();
    } else if (authStatus === "unauthenticated") {
      setBooks([]);
      setStatus("ready");
    }
  }, [authStatus, load]);

  const findBook = useCallback(
    (id: string) => books.find((book) => book.id === id),
    [books],
  );

  const createBook = useCallback(async (draft: BookDraft) => {
    try {
      const created = await bookService.create(draft);
      setBooks((current) => [created, ...current]);
      return created;
    } catch (caught) {
      throw toApiError(caught);
    }
  }, []);

  const updateBook = useCallback(
    async (id: string, patch: Partial<BookDraft>) => {
      try {
        const updated = await bookService.update(id, patch);
        setBooks((current) =>
          current.map((book) => (book.id === id ? updated : book)),
        );
        return updated;
      } catch (caught) {
        throw toApiError(caught);
      }
    },
    [],
  );

  const changeStatus = useCallback(
    async (id: string, nextStatus: BookStatus) => {
      let previous: Book | undefined;

      setBooks((current) =>
        current.map((book) => {
          if (book.id !== id) return book;
          previous = book;
          // Mirror the server's progress/status rule so the optimistic row
          // never shows an impossible combination.
          const progress =
            nextStatus === "completed"
              ? 100
              : nextStatus === "want-to-read"
                ? 0
                : book.progress;
          return { ...book, status: nextStatus, progress };
        }),
      );

      try {
        const updated = await bookService.update(id, { status: nextStatus });
        setBooks((current) =>
          current.map((book) => (book.id === id ? updated : book)),
        );
      } catch (caught) {
        if (previous) {
          const rollback = previous;
          setBooks((current) =>
            current.map((book) => (book.id === id ? rollback : book)),
          );
        }
        throw toApiError(caught);
      }
    },
    [],
  );

  const deleteBook = useCallback(async (id: string) => {
    try {
      await bookService.remove(id);
      setBooks((current) => current.filter((book) => book.id !== id));
    } catch (caught) {
      throw toApiError(caught);
    }
  }, []);

  const value = useMemo(
    () => ({
      books,
      status,
      error,
      reload: load,
      findBook,
      createBook,
      updateBook,
      changeStatus,
      deleteBook,
    }),
    [
      books,
      status,
      error,
      load,
      findBook,
      createBook,
      updateBook,
      changeStatus,
      deleteBook,
    ],
  );

  return (
    <BooksContext.Provider value={value}>{children}</BooksContext.Provider>
  );
}

export function useBooks(): BooksContextValue {
  const context = useContext(BooksContext);
  if (!context) throw new Error("useBooks must be used inside <BooksProvider>");
  return context;
}
