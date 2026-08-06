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
import { httpClient } from "@/services/http-client";
import { mockBackend } from "./mock/mock-backend";

interface ApiUser {
  _id?: string;
  id?: string;
  name: string;
  email: string;
}

interface UserEnvelope {
  user: ApiUser;
}

interface ApiAuthSession {
  token: string;
  user: ApiUser;
}

function toUser(user: ApiUser): User {
  return {
    id: user._id ?? user.id ?? "",
    name: user.name,
    email: user.email,
  };
}

function toAuthSession(session: ApiAuthSession): AuthSession {
  return {
    token: session.token,
    user: toUser(session.user),
  };
}

export const authService = {
  async signup(payload: SignupPayload): Promise<AuthSession> {
    if (usingMockBackend) return mockBackend.signup(payload);
    const response = await httpClient.post<ApiAuthSession>("/auth/signup", { ...payload }, {
      anonymous: true,
    });
    return toAuthSession(response);
  },

  async login(credentials: Credentials): Promise<AuthSession> {
    if (usingMockBackend) return mockBackend.login(credentials);
    const response = await httpClient.post<ApiAuthSession>("/auth/login", { ...credentials }, {
      anonymous: true,
    });
    return toAuthSession(response);
  },

  /** Verifies a stored token is still good and returns the fresh user. */
  async me(): Promise<User> {
    if (usingMockBackend) return mockBackend.me();
    const response = await httpClient.get<UserEnvelope>("/profile");
    return toUser(response.user);
  },

  async updateProfile(update: ProfileUpdate): Promise<User> {
    if (usingMockBackend) return mockBackend.updateProfile(update);
    const response = await httpClient.patch<UserEnvelope>("/profile", {
      ...update,
    });
    return toUser(response.user);
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
