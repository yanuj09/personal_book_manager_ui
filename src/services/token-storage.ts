/**
 * Where the JWT lives on the client.
 *
 * Isolated behind this module so swapping localStorage for an httpOnly cookie
 * flow later is a one-file change — nothing else reads the raw storage key.
 */

const TOKEN_KEY = "pbm.token";
const USER_KEY = "pbm.user";

const canUseStorage = () => typeof window !== "undefined";

export const tokenStorage = {
  read(): string | null {
    if (!canUseStorage()) return null;
    try {
      return window.localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  write(token: string): void {
    if (!canUseStorage()) return;
    try {
      window.localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* private mode / quota — the session just won't survive a reload */
    }
  },

  clear(): void {
    if (!canUseStorage()) return;
    try {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(USER_KEY);
    } catch {
      /* ignore */
    }
  },
};

/**
 * A cached copy of the signed-in user, so the first paint after a reload has a
 * name to show instead of a spinner. The token remains the source of truth.
 */
export const userCache = {
  read<T>(): T | null {
    if (!canUseStorage()) return null;
    try {
      const raw = window.localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },

  write(user: unknown): void {
    if (!canUseStorage()) return;
    try {
      window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      /* ignore */
    }
  },
};
