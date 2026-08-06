/**
 * One error type for every failure the UI has to explain to a person.
 *
 * Transport errors, HTTP errors and mock-backend errors all arrive as an
 * ApiError, so views only ever branch on `status` and print `message`.
 */
export class ApiError extends Error {
  readonly status: number;
  /** Server-side per-field messages, keyed the same way the forms are. */
  readonly fieldErrors: Record<string, string>;

  constructor(
    message: string,
    status = 0,
    fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }

  get isUnauthorized(): boolean {
    return this.status === 401 || this.status === 403;
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }
}

/** Never let a raw `unknown` from a catch block reach the UI. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof Error) return new ApiError(error.message);
  return new ApiError("Something went wrong. Please try again.");
}
