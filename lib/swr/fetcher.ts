import { apiFetch } from "@/lib/api/http";

// Generic SWR fetcher for simple string-key GET resources
export const fetcher = <T>(path: string): Promise<T> => apiFetch<T>(path);
