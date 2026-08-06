/**
 * Auth transport.
 *
 * Controllers call these and never touch fetch, tokens or the mock directly.
 * Both branches return the same shapes, so nothing downstream knows or cares
 * which backend answered.
 */

import { usingMockBackend } from "@/lib/env";
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

interface UserEnvelope {
  user: User;
}

export const authService = {
  signup(payload: SignupPayload): Promise<AuthSession> {
    if (usingMockBackend) return mockBackend.signup(payload);
    return httpClient.post<AuthSession>("/auth/signup", { ...payload }, {
      anonymous: true,
    });
  },

  login(credentials: Credentials): Promise<AuthSession> {
    if (usingMockBackend) return mockBackend.login(credentials);
    return httpClient.post<AuthSession>("/auth/login", { ...credentials }, {
      anonymous: true,
    });
  },

  /** Verifies a stored token is still good and returns the fresh user. */
  async me(): Promise<User> {
    if (usingMockBackend) return mockBackend.me();
    const response = await httpClient.get<UserEnvelope>("/profile");
    return response.user;
  },

  async updateProfile(update: ProfileUpdate): Promise<User> {
    if (usingMockBackend) return mockBackend.updateProfile(update);
    const response = await httpClient.patch<UserEnvelope>("/profile", {
      ...update,
    });
    return response.user;
  },

  changePassword(change: PasswordChange): Promise<void> {
    if (usingMockBackend) return mockBackend.changePassword(change);
    return httpClient.patch<void>("/profile/password", { ...change });
  },

  logout(): Promise<void> {
    if (usingMockBackend) return Promise.resolve();
    return httpClient.post<void>("/auth/logout");
  },
};
