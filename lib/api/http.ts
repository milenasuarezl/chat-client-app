import { config } from "@/lib/config";
import { authHeaders } from "./auth";
import { ApiError } from "./errors";

/**
 * Thin, typed `fetch` wrapper for the chat API. Isomorphic: it runs on the
 * server (SSR) and in the browser (SWR polling). Auth headers are supplied by
 * `authHeaders()` so the transport stays agnostic to the auth scheme.
 *
 * SECURITY: because the client calls the API directly, the token is exposed to
 * the browser. See "Future improvements" in the README for hiding it behind a
 * same-origin proxy.
 */
export const apiFetch = async <T>(
  path: string,
  init: RequestInit = {},
): Promise<T> => {
  const url = `${config.apiBaseUrl}${path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
        ...init.headers,
      },
    });
  } catch (cause) {
    throw new ApiError("Unable to reach the chat service.", 0, cause);
  }

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status);
  }

  return (await readJsonBody<T>(response)) as T;
};

/**
 * Parse a JSON response body based on whether a body is actually present rather
 * than on specific status codes. Any empty-body response (204, 205, a bare 200,
 * etc.) resolves to `undefined` so callers can type such endpoints as
 * `apiFetch<void>(...)`. This mirrors how libraries like ky and axios handle it.
 */
const readJsonBody = async <T>(response: Response): Promise<T | undefined> => {
  const text = await response.text();
  if (text.trim() === "") {
    return undefined;
  }

  return JSON.parse(text) as T;
};

/** Best-effort extraction of a human-readable error from the response body. */
const readErrorMessage = async (response: Response): Promise<string> => {
  try {
    const data = (await response.json()) as { error?: { message?: string } | string };
    if (typeof data.error === "string") return data.error;
    if (data.error?.message) return data.error.message;
  } catch {
    // Body was not JSON — fall through to the status text.
  }
  return response.statusText || `Request failed with status ${response.status}`;
};
