import { act, renderHook, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { SWRConfig } from "swr";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/errors";
import { createMessage, fetchMessages } from "../api/messages";
import { CURRENT_USER } from "../constants";
import type { Message } from "../types";
import { useMessages } from "./useMessages";
import { useSendMessage } from "./useSendMessage";

vi.mock("../api/messages", () => ({
  fetchMessages: vi.fn(),
  createMessage: vi.fn(),
}));

const mockedFetchMessages = vi.mocked(fetchMessages);
const mockedCreateMessage = vi.mocked(createMessage);

const makeMessage = (overrides: Partial<Message> = {}): Message => ({
  id: "1",
  author: "Ada",
  text: "Hello",
  timestamp: "2024-01-01T00:00:00.000Z",
  isOutgoing: false,
  ...overrides,
});

const createWrapper = () => {
  const Wrapper = ({ children }: PropsWithChildren) => (
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      {children}
    </SWRConfig>
  );
  Wrapper.displayName = "SWRTestWrapper";
  return Wrapper;
};

const renderChat = () =>
  renderHook(() => ({ list: useMessages(), send: useSendMessage() }), {
    wrapper: createWrapper(),
  });

describe("useSendMessage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedFetchMessages.mockResolvedValue([]);
  });

  it("sends the trimmed text authored by the current user", async () => {
    const created = makeMessage({
      id: "msg-hi-there",
      author: CURRENT_USER,
      text: "Hi there",
      isOutgoing: true,
    });
    mockedCreateMessage.mockResolvedValue(created);

    const { result } = renderChat();

    await act(async () => {
      await result.current.send.sendMessage("  Hi there  ");
    });

    expect(mockedCreateMessage).toHaveBeenCalledTimes(1);
    expect(mockedCreateMessage).toHaveBeenCalledWith({
      message: "Hi there",
      author: CURRENT_USER,
    });
    expect(result.current.send.error).toBeNull();
    expect(result.current.send.isSending).toBe(false);
  });

  it("adds the sent message to the shared list on success", async () => {
    const created = makeMessage({
      id: "msg-hello",
      author: CURRENT_USER,
      text: "Hello",
      isOutgoing: true,
    });
    mockedCreateMessage.mockResolvedValue(created);
    mockedFetchMessages.mockResolvedValue([created]);

    const { result } = renderChat();

    await act(async () => {
      await result.current.send.sendMessage("Hello");
    });

    await waitFor(() =>
      expect(result.current.list.messages).toContainEqual(created),
    );
  });

  it("ignores whitespace-only text without calling the API", async () => {
    const { result } = renderChat();

    await act(async () => {
      await result.current.send.sendMessage("   ");
    });

    expect(mockedCreateMessage).not.toHaveBeenCalled();
    expect(result.current.send.isSending).toBe(false);
  });

  it("rolls back the optimistic message and exposes the error on failure", async () => {
    const existing = makeMessage({ id: "existing" });
    mockedFetchMessages.mockResolvedValue([existing]);
    const apiError = new ApiError("Server down", 500);
    mockedCreateMessage.mockRejectedValue(apiError);

    const { result } = renderChat();
    await waitFor(() =>
      expect(result.current.list.messages).toEqual([existing]),
    );

    await act(async () => {
      await result.current.send.sendMessage("Hello").catch(() => {});
    });

    expect(result.current.send.error).toBe(apiError);
    await waitFor(() =>
      expect(result.current.list.messages).toEqual([existing]),
    );
  });

  it("normalizes non-ApiError failures into an ApiError", async () => {
    mockedCreateMessage.mockRejectedValue(new Error("network glitch"));

    const { result } = renderChat();

    await act(async () => {
      await result.current.send.sendMessage("Hello").catch(() => {});
    });

    expect(result.current.send.error).toBeInstanceOf(ApiError);
    expect(result.current.send.error?.status).toBe(0);
  });
});
