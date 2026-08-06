import axios from "axios";
import type {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { env } from "@/lib/env";
import { ApiError } from "./api-error";
import { tokenStorage } from "./token-storage";

type Body = Record<string, unknown> | undefined;

interface RequestOptions {
  /** Skip the Authorization header — used by login and signup. */
  anonymous?: boolean;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  /**
   * Keep cookie auth enabled by default. Use "omit" to opt out for one request.
   */
  credentials?: RequestCredentials;
}

interface RequestConfig extends AxiosRequestConfig {
  anonymous?: boolean;
}

const api = axios.create({
  // baseURL: env.apiUrl,
  baseURL: "https://personal-book-manager-backend-fw3z.onrender.com",
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const next = config as InternalAxiosRequestConfig & { anonymous?: boolean };

  if (!next.anonymous) {
    const token = tokenStorage.read();
    if (token) next.headers.Authorization = `Bearer ${token}`;
  }

  return next;
});

api.interceptors.response.use(
  (response) => {
    response.data = unwrapSuccess(response.data);
    return response;
  },
  (error: AxiosError) => {
    const normalized = toApiError(error);
    if (normalized.isUnauthorized) tokenStorage.clear();
    return Promise.reject(normalized);
  },
);

function toApiError(error: AxiosError): ApiError {
  if (!error.response) {
    return new ApiError("Can't reach the server. Check your connection.", 0);
  }

  const status = error.response.status;
  const payload = error.response.data;

  return new ApiError(
    readMessage(payload) ?? `Request failed (${status})`,
    status,
    readFieldErrors(payload),
  );
}

function readMessage(payload: unknown): string | null {
  if (payload && typeof payload === "object") {
    const message = (payload as { message?: unknown; error?: unknown }).message;
    if (typeof message === "string") return message;
    const error = (payload as { error?: unknown }).error;
    if (typeof error === "string") return error;
  }
  return null;
}

function readFieldErrors(payload: unknown): Record<string, string> {
  if (payload && typeof payload === "object") {
    const errors = (payload as { errors?: unknown }).errors;
    if (errors && typeof errors === "object") {
      return errors as Record<string, string>;
    }
  }
  return {};
}

function unwrapSuccess<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

function withRequestOptions(options?: RequestOptions): RequestConfig {
  const withCredentials = options?.credentials === "omit" ? false : true;
  return {
    anonymous: options?.anonymous,
    signal: options?.signal,
    headers: options?.headers,
    withCredentials,
  };
}

export const httpClient = {
  get: async <T>(path: string, options?: RequestOptions) => {
    const response = await api.get<T>(path, withRequestOptions(options));
    return response.data;
  },
  post: async <T>(path: string, body?: Body, options?: RequestOptions) => {
    const response = await api.post<T>(path, body, withRequestOptions(options));
    return response.data;
  },
  patch: async <T>(path: string, body?: Body, options?: RequestOptions) => {
    const response = await api.patch<T>(path, body, withRequestOptions(options));
    return response.data;
  },
  put: async <T>(path: string, body?: Body, options?: RequestOptions) => {
    const response = await api.put<T>(path, body, withRequestOptions(options));
    return response.data;
  },
  delete: async <T>(path: string, options?: RequestOptions) => {
    const response = await api.delete<T>(path, withRequestOptions(options));
    return response.data;
  },
  interceptors: {
    request: {
      use(
        onFulfilled?: (value: InternalAxiosRequestConfig) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>,
        onRejected?: (error: unknown) => unknown,
      ) {
        return api.interceptors.request.use(onFulfilled, onRejected);
      },
      eject(id: number) {
        api.interceptors.request.eject(id);
      },
    },
    response: {
      use(
        onFulfilled?: (value: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>,
        onRejected?: (error: unknown) => unknown,
      ) {
        return api.interceptors.response.use(onFulfilled, onRejected);
      },
      eject(id: number) {
        api.interceptors.response.eject(id);
      },
    },
  },
};
