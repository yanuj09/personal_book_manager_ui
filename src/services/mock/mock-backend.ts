/**
 * An in-browser stand-in for the real API.
 *
 * It exists so the frontend is runnable and reviewable before the Express /
 * MongoDB layer lands. It speaks exactly the same method signatures as the HTTP
 * services and throws the same `ApiError`s, so swapping to the real backend is
 * a config change (`NEXT_PUBLIC_API_URL`) and nothing more.
 *
 * Data is persisted to localStorage and scoped per user id.
 */

import {
  clampProgress,
  reconcileProgress,
  type Book,
  type BookDraft,
} from "@/models/book.model";
import type {
  AuthSession,
  Credentials,
  PasswordChange,
  ProfileUpdate,
  SignupPayload,
  User,
} from "@/models/user.model";
import { ApiError } from "../api-error";
import { SEED_BOOKS } from "./seed-books";

const ACCOUNTS_KEY = "pbm.mock.accounts";
const BOOKS_KEY = "pbm.mock.books";
const LATENCY_MS = 260;

interface Account extends User {
  password: string;
}

/* -------------------------------------------------------------------------- */
/*  Storage plumbing                                                           */
/* -------------------------------------------------------------------------- */

function readStore<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStore(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota failures — the mock is best-effort by design */
  }
}

/** Enough latency for loading states to be visible and honest. */
function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));
}

function newId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/* -------------------------------------------------------------------------- */
/*  Fake tokens                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Shaped like a JWT (`header.payload.signature`) so the client-side handling is
 * identical to production. It is *not* signed and proves nothing — the real
 * token comes from the server.
 */
function issueToken(userId: string): string {
  const header = base64Url(JSON.stringify({ alg: "none", typ: "JWT" }));
  const payload = base64Url(
    JSON.stringify({
      sub: userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    }),
  );
  return `${header}.${payload}.mock`;
}

function base64Url(value: string): string {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function userIdFromToken(token: string): string | null {
  const [, payload] = token.split(".");
  if (!payload) return null;
  try {
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const parsed = JSON.parse(json) as { sub?: string; exp?: number };
    if (parsed.exp && parsed.exp * 1000 < Date.now()) return null;
    return parsed.sub ?? null;
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/*  Accounts                                                                   */
/* -------------------------------------------------------------------------- */

function readAccounts(): Account[] {
  return readStore<Account[]>(ACCOUNTS_KEY, []);
}

function writeAccounts(accounts: Account[]): void {
  writeStore(ACCOUNTS_KEY, accounts);
}

function publicUser(account: Account): User {
  return { id: account.id, name: account.name, email: account.email };
}

/* -------------------------------------------------------------------------- */
/*  Books, scoped per user                                                     */
/* -------------------------------------------------------------------------- */

type BooksByUser = Record<string, Book[]>;

function readAllBooks(): BooksByUser {
  return readStore<BooksByUser>(BOOKS_KEY, {});
}

function readBooksFor(userId: string): Book[] {
  return readAllBooks()[userId] ?? [];
}

function writeBooksFor(userId: string, books: Book[]): void {
  const all = readAllBooks();
  all[userId] = books;
  writeStore(BOOKS_KEY, all);
}

/** New accounts start with a small shelf so the dashboard is never a blank slate. */
function seedShelfFor(userId: string): void {
  const now = Date.now();
  const books: Book[] = SEED_BOOKS.map((seed, index) => {
    // Stagger timestamps so "recently updated" ordering is meaningful.
    const updatedAt = new Date(now - index * 86_400_000 * 3).toISOString();
    return {
      id: newId(),
      title: seed.title,
      author: seed.author,
      description: seed.description,
      tags: [...seed.tags],
      status: seed.status,
      progress: clampProgress(seed.progress),
      notes: seed.notes ?? "",
      createdAt: updatedAt,
      updatedAt,
      completedAt: seed.status === "completed" ? updatedAt : null,
    };
  });
  writeBooksFor(userId, books);
}

/* -------------------------------------------------------------------------- */
/*  The "API"                                                                  */
/* -------------------------------------------------------------------------- */

function requireAccount(userId: string): Account {
  const account = readAccounts().find((candidate) => candidate.id === userId);
  if (!account) throw new ApiError("Your session has expired.", 401);
  return account;
}

function currentUserId(): string {
  // Read lazily so the token module stays the single source of truth.
  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem("pbm.token")
      : null;
  const userId = token ? userIdFromToken(token) : null;
  if (!userId) throw new ApiError("Your session has expired.", 401);
  return userId;
}

export const mockBackend = {
  async signup(payload: SignupPayload): Promise<AuthSession> {
    const accounts = readAccounts();
    const email = payload.email.trim().toLowerCase();

    if (accounts.some((account) => account.email === email)) {
      throw new ApiError("An account with that email already exists.", 409, {
        email: "That email is already registered.",
      });
    }

    const account: Account = {
      id: newId(),
      name: payload.name.trim(),
      email,
      password: payload.password,
    };

    writeAccounts([...accounts, account]);
    seedShelfFor(account.id);

    return delay({ user: publicUser(account), token: issueToken(account.id) });
  },

  async login(credentials: Credentials): Promise<AuthSession> {
    const email = credentials.email.trim().toLowerCase();
    const account = readAccounts().find(
      (candidate) => candidate.email === email,
    );

    // Same message either way — don't leak which emails are registered.
    if (!account || account.password !== credentials.password) {
      throw new ApiError("Email or password is incorrect.", 401);
    }

    return delay({ user: publicUser(account), token: issueToken(account.id) });
  },

  async me(): Promise<User> {
    const account = requireAccount(currentUserId());
    return delay(publicUser(account));
  },

  async updateProfile(update: ProfileUpdate): Promise<User> {
    const userId = currentUserId();
    const accounts = readAccounts();
    const index = accounts.findIndex((account) => account.id === userId);
    if (index === -1) throw new ApiError("Your session has expired.", 401);

    const email = update.email.trim().toLowerCase();
    const takenByAnother = accounts.some(
      (account) => account.email === email && account.id !== userId,
    );
    if (takenByAnother) {
      throw new ApiError("That email is already in use.", 409, {
        email: "That email is already in use.",
      });
    }

    accounts[index] = { ...accounts[index], name: update.name.trim(), email };
    writeAccounts(accounts);

    return delay(publicUser(accounts[index]));
  },

  async changePassword(change: PasswordChange): Promise<void> {
    const userId = currentUserId();
    const accounts = readAccounts();
    const index = accounts.findIndex((account) => account.id === userId);
    if (index === -1) throw new ApiError("Your session has expired.", 401);

    if (accounts[index].password !== change.currentPassword) {
      throw new ApiError("That's not your current password.", 400, {
        currentPassword: "That's not your current password.",
      });
    }

    accounts[index] = { ...accounts[index], password: change.newPassword };
    writeAccounts(accounts);

    await delay(null);
  },

  async listBooks(): Promise<Book[]> {
    return delay(readBooksFor(currentUserId()));
  },

  async getBook(id: string): Promise<Book> {
    const book = readBooksFor(currentUserId()).find(
      (candidate) => candidate.id === id,
    );
    if (!book) throw new ApiError("We couldn't find that book.", 404);
    return delay(book);
  },

  async createBook(draft: BookDraft): Promise<Book> {
    const userId = currentUserId();
    const reconciled = reconcileProgress(draft);
    const now = new Date().toISOString();

    const book: Book = {
      id: newId(),
      title: reconciled.title.trim(),
      author: reconciled.author.trim(),
      description: reconciled.description.trim(),
      tags: reconciled.tags,
      status: reconciled.status,
      progress: reconciled.progress,
      notes: reconciled.notes,
      createdAt: now,
      updatedAt: now,
      completedAt: reconciled.status === "completed" ? now : null,
    };

    writeBooksFor(userId, [book, ...readBooksFor(userId)]);
    return delay(book);
  },

  async updateBook(id: string, patch: Partial<BookDraft>): Promise<Book> {
    const userId = currentUserId();
    const books = readBooksFor(userId);
    const index = books.findIndex((candidate) => candidate.id === id);
    if (index === -1) throw new ApiError("We couldn't find that book.", 404);

    const existing = books[index];
    const merged = reconcileProgress({
      title: patch.title ?? existing.title,
      author: patch.author ?? existing.author,
      description: patch.description ?? existing.description,
      tags: patch.tags ?? existing.tags,
      status: patch.status ?? existing.status,
      progress: patch.progress ?? existing.progress,
      notes: patch.notes ?? existing.notes,
    });

    const now = new Date().toISOString();
    const becameComplete =
      merged.status === "completed" && existing.status !== "completed";

    const updated: Book = {
      ...existing,
      title: merged.title.trim(),
      author: merged.author.trim(),
      description: merged.description.trim(),
      tags: merged.tags,
      status: merged.status,
      progress: merged.progress,
      notes: merged.notes,
      updatedAt: now,
      completedAt:
        merged.status === "completed"
          ? becameComplete
            ? now
            : existing.completedAt
          : null,
    };

    books[index] = updated;
    writeBooksFor(userId, books);

    return delay(updated);
  },

  async deleteBook(id: string): Promise<void> {
    const userId = currentUserId();
    const books = readBooksFor(userId);
    const remaining = books.filter((book) => book.id !== id);
    if (remaining.length === books.length) {
      throw new ApiError("We couldn't find that book.", 404);
    }
    writeBooksFor(userId, remaining);
    await delay(null);
  },
};
