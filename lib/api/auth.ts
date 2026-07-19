import { config } from "@/lib/config";

export const authHeaders = (): Record<string, string> =>
  config.apiToken ? { Authorization: `Bearer ${config.apiToken}` } : {};
