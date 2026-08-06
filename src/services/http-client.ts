import { env } from "@/lib/env";
import { ApiError } from "./api-error";
import { tokenStorage } from "./token-storage";

type Body = Record<string, unknown> | undefined;
type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

interface RequestOptions {
  /** Skip the Authorization header — used by login and signup. */
  anonymous?: boolean;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  /**
   * Defaults to "include" so cookie auth works out of the box.
   * Can be overridden for edge cases.
   */
  credentials?: RequestCredentials;
}

interface RequestContext {
  method: Method;
  path: string;
  url: string;
  body?: Body;
  options: RequestOptions;
  headers: Record<string, string>;
  init: RequestInit;
}

interface ResponseContext<T> {
  request: RequestContext;
  response: Response;
  raw: string;
  payload: unknown;
  data: T;
}

type RequestInterceptor =
  | ((context: RequestContext) => RequestContext)
  | ((context: RequestContext) => Promise<RequestContext>);
type ResponseInterceptor =
  | (<T>(context: ResponseContext<T>) => ResponseContext<T>)
  | (<T>(context: ResponseContext<T>) => Promise<ResponseContext<T>>);
type ErrorInterceptor =
  | ((error: unknown) => unknown)
  | ((error: unknown) => Promise<unknown>);

const requestInterceptors: RequestInterceptor[] = [];
const responseInterceptors: ResponseInterceptor[] = [];
const errorInterceptors: ErrorInterceptor[] = [];

requestInterceptors.push((context) => {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(context.options.headers ?? {}),
  };

  if (context.body !== undefined) headers["Content-Type"] = "application/json";

  if (!context.options.anonymous) {
    const token = tokenStorage.read();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  return {
    ...context,
    headers,
    init: {
      ...context.init,
      headers,
      credentials: context.options.credentials ?? "include",
      body:
        context.body === undefined ? undefined : JSON.stringify(context.body),
    },
  };
});

errorInterceptors.push((error) => {
  if (error instanceof DOMException && error.name === "AbortError") return error;
  if (error instanceof ApiError) {
    if (error.isUnauthorized) tokenStorage.clear();
    return error;
  }
  if (error instanceof Error) {
    return new ApiError(error.message);
  }
  return new ApiError("Can't reach the server. Check your connection.", 0);
});

async function request<T>(
  method: Method,
  path: string,
  body?: Body,
  options: RequestOptions = {},
): Promise<T> {
  let requestContext: RequestContext = {
    method,
    path,
    url: `${env.apiUrl}${path}`,
    body,
    options,
    headers: {},
    init: {
      method,
      signal: options.signal,
    },
  };

  for (const interceptor of requestInterceptors) {
    requestContext = await interceptor(requestContext);
  }

  let response: Response;
  try {
    response = await fetch(requestContext.url, requestContext.init);
  } catch (error) {
    throw await runErrorInterceptors(error);
  }

  // 204 and friends carry no body.
  const raw = await response.text();
  const payload = raw ? safeParse(raw) : null;

  if (!response.ok) {
    throw await runErrorInterceptors(
      new ApiError(
      readMessage(payload) ?? `Request failed (${response.status})`,
      response.status,
      readFieldErrors(payload),
      ),
    );
  }

  const data = unwrapSuccess<T>(payload);

  let responseContext: ResponseContext<T> = {
    request: requestContext,
    response,
    raw,
    payload,
    data,
  };

  for (const interceptor of responseInterceptors) {
    responseContext = await interceptor(responseContext);
  }

  return responseContext.data;
}

async function runErrorInterceptors(error: unknown): Promise<unknown> {
  let nextError = error;
  for (const interceptor of errorInterceptors) {
    nextError = await interceptor(nextError);
  }
  return nextError;
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

function unwrapSuccess<T>(payload: unknown): T {
  // Common API envelope style.
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  // Tolerate bare JSON response bodies.
  return payload as T;
}

function addInterceptor<T>(list: T[], interceptor: T): () => void {
  list.push(interceptor);
  return () => {
    const index = list.indexOf(interceptor);
    if (index >= 0) list.splice(index, 1);
  };
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
  interceptors: {
    request: {
      use(interceptor: RequestInterceptor) {
        return addInterceptor(requestInterceptors, interceptor);
      },
    },
    response: {
      use(interceptor: ResponseInterceptor) {
        return addInterceptor(responseInterceptors, interceptor);
      },
    },
    error: {
      use(interceptor: ErrorInterceptor) {
        return addInterceptor(errorInterceptors, interceptor);
      },
    },
  },
};
