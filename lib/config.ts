/**
 * Client-safe runtime configuration.
 *
 * SECURITY NOTE: `apiToken` uses a `NEXT_PUBLIC_` variable, so it is shipped to
 * the browser. For production mode, we need to hide the token, see README → Future improvements).
 */
export const config = {
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api/v1",
  /** Shared bearer token for the exercise. */
  apiToken: process.env.NEXT_PUBLIC_API_TOKEN ?? "super-secret-doodle-token",
} as const;
