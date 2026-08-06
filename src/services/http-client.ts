import { env } from "@/config/env";
import { ApiError } from "./api-error";
import { tokenStorage } from "./token-storage";

type Body = Record<string, unknown> | undefined;

interface RequestOptions {
  /** Skip the Authorization header — used by login and signup. */
  anonymous?: boolean;
  signal?: AbortSignal;
}

async function request<T>(
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
  path: string,
  body?: Body,
  options: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };

  if (body !== undefined) headers["Content-Type"] = "application/json";

  if (!options.anonymous) {
    const token = tokenStorage.read();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${env.apiUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError("Can't reach the server. Check your connection.", 0);
  }

  // 204 and friends carry no body.
  const raw = await response.text();
  const payload = raw ? safeParse(raw) : null;

  if (!response.ok) {
    throw new ApiError(
      readMessage(payload) ?? `Request failed (${response.status})`,
      response.status,
      readFieldErrors(payload),
    );
  }

  // The API wraps successful payloads in `{ data }`; tolerate a bare body too.
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

function safeParse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return { message: raw };
  }
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

export const httpClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>("GET", path, undefined, options),
  post: <T>(path: string, body?: Body, options?: RequestOptions) =>
    request<T>("POST", path, body, options),
  patch: <T>(path: string, body?: Body, options?: RequestOptions) =>
    request<T>("PATCH", path, body, options),
  put: <T>(path: string, body?: Body, options?: RequestOptions) =>
    request<T>("PUT", path, body, options),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>("DELETE", path, undefined, options),
};
