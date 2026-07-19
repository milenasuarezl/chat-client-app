import { renderHook, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { SWRConfig } from "swr";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchMessages } from "../api/messages";
import type { Message } from "../types";
import { useMessages } from "./useMessages";

vi.mock("../api/messages", () => ({
  fetchMessages: vi.fn(),
}));

const mockedFetchMessages = vi.mocked(fetchMessages);

/** Fresh SWR cache per hook render so tests never share state. */
const createWrapper = () => {
  const Wrapper = ({ children }: PropsWithChildren) => (
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      {children}
    </SWRConfig>
  );
  Wrapper.displayName = "SWRTestWrapper";
  return Wrapper;
};

describe("useMessages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("defaults to an empty list when SWR has no data yet", () => {
    mockedFetchMessages.mockReturnValue(new Promise<Message[]>(() => {}));

    const { result } = renderHook(() => useMessages(), {
      wrapper: createWrapper(),
    });

    expect(result.current.messages).toEqual([]);
  });

  it("uses the default limit when none is provided", async () => {
    mockedFetchMessages.mockResolvedValue([]);

    renderHook(() => useMessages(), { wrapper: createWrapper() });

    await waitFor(() =>
      expect(mockedFetchMessages).toHaveBeenCalledWith({ limit: 50 }),
    );
  });

  it("requests the provided limit", async () => {
    mockedFetchMessages.mockResolvedValue([]);

    renderHook(() => useMessages({ limit: 5 }), { wrapper: createWrapper() });

    await waitFor(() =>
      expect(mockedFetchMessages).toHaveBeenCalledWith({ limit: 5 }),
    );
  });
});
