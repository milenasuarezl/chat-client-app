/**
 * The error we throw whenever an API call fails.
 * It doesn't care whether the request came from `fetch`, SWR, or something else,
 * it's safe to use in both server and browser code.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Type guard so `catch (e)` blocks can narrow safely. */
export const isApiError = (error: unknown): error is ApiError =>
  error instanceof ApiError;
