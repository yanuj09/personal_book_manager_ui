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
import type {
  AuthSession,
  Credentials,
  SignupPayload,
  User,
} from "@/models/user.model";
import { authService } from "@/services/auth.service";
import { toApiError } from "@/services/api-error";
import { tokenStorage, userCache } from "@/services/token-storage";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  login: (credentials: Credentials) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => Promise<void>;
  /** Push a locally-updated user (e.g. after a profile save) into the session. */
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  /**
   * Restore the session on first mount.
   *
   * The cached user paints immediately so a returning reader sees their own
   * name instead of a spinner; `me()` then confirms the token is still valid
   * and corrects anything stale.
   */
  useEffect(() => {
    let cancelled = false;

    const token = tokenStorage.read();
    if (!token) {
      setStatus("unauthenticated");
      return;
    }

    const cached = userCache.read<User>();
    if (cached) {
      setUserState(cached);
      setStatus("authenticated");
    }

    authService
      .me()
      .then((fresh) => {
        if (cancelled) return;
        setUserState(fresh);
        userCache.write(fresh);
        setStatus("authenticated");
      })
      .catch(() => {
        if (cancelled) return;
        tokenStorage.clear();
        setUserState(null);
        setStatus("unauthenticated");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const adoptSession = useCallback((session: AuthSession) => {
    tokenStorage.write(session.token);
    userCache.write(session.user);
    setUserState(session.user);
    setStatus("authenticated");
  }, []);

  const login = useCallback(
    async (credentials: Credentials) => {
      try {
        adoptSession(await authService.login(credentials));
      } catch (error) {
        throw toApiError(error);
      }
    },
    [adoptSession],
  );

  const signup = useCallback(
    async (payload: SignupPayload) => {
      try {
        adoptSession(await authService.signup(payload));
      } catch (error) {
        throw toApiError(error);
      }
    },
    [adoptSession],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Always clear local session even if server logout fails.
    } finally {
      tokenStorage.clear();
      setUserState(null);
      setStatus("unauthenticated");
    }
  }, []);

  const setUser = useCallback((next: User) => {
    setUserState(next);
    userCache.write(next);
  }, []);

  const value = useMemo(
    () => ({ user, status, login, signup, logout, setUser }),
    [user, status, login, signup, logout, setUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
