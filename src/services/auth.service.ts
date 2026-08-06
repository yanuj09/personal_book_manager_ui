/**
 * Auth transport.
 *
 * Controllers call these and never touch fetch, tokens or the mock directly.
 * Both branches return the same shapes, so nothing downstream knows or cares
 * which backend answered.
 */

import { usingMockBackend } from "@/config/env";
import type {
  AuthSession,
  Credentials,
  PasswordChange,
  ProfileUpdate,
  SignupPayload,
  User,
} from "@/models/user.model";
import { httpClient } from "./http-client";
import { mockBackend } from "./mock/mock-backend";

export const authService = {
  signup(payload: SignupPayload): Promise<AuthSession> {
    if (usingMockBackend) return mockBackend.signup(payload);
    return httpClient.post<AuthSession>("/api/auth/signup", { ...payload }, {
      anonymous: true,
    });
  },

  login(credentials: Credentials): Promise<AuthSession> {
    if (usingMockBackend) return mockBackend.login(credentials);
    return httpClient.post<AuthSession>("/api/auth/login", { ...credentials }, {
      anonymous: true,
    });
  },

  /** Verifies a stored token is still good and returns the fresh user. */
  me(): Promise<User> {
    if (usingMockBackend) return mockBackend.me();
    return httpClient.get<User>("/api/auth/me");
  },

  updateProfile(update: ProfileUpdate): Promise<User> {
    if (usingMockBackend) return mockBackend.updateProfile(update);
    return httpClient.patch<User>("/api/auth/profile", { ...update });
  },

  changePassword(change: PasswordChange): Promise<void> {
    if (usingMockBackend) return mockBackend.changePassword(change);
    return httpClient.post<void>("/api/auth/password", { ...change });
  },
};
