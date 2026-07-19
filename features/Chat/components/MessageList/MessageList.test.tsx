import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MessageList } from "./MessageList";
import type { Message } from "@/lib/types";

const makeMessage = (overrides: Partial<Message> = {}): Message => ({
  id: "1",
  author: "Ada",
  text: "First message",
  timestamp: "2026-07-19T09:05:00.000Z",
  isOutgoing: false,
  ...overrides,
});

describe("MessageList", () => {
  it("renders an accessible feed labelled as the message history", () => {
    const messages = [makeMessage()];

    render(<MessageList messages={messages} />);

    expect(
      screen.getByRole("feed", { name: "Message history" })
    ).toBeInTheDocument();
  });

  it("renders one focusable article per message with position metadata", () => {
    const messages = [
      makeMessage({ id: "1", text: "First message" }),
      makeMessage({ id: "2", author: "You", text: "Second message", isOutgoing: true }),
    ];

    render(<MessageList messages={messages} />);

    const articles = screen.getAllByRole("article");
    expect(articles).toHaveLength(messages.length);
    expect(screen.getByText("First message")).toBeInTheDocument();
    expect(screen.getByText("Second message")).toBeInTheDocument();

    expect(articles[0]).toHaveAttribute("aria-posinset", "1");
    expect(articles[0]).toHaveAttribute("aria-setsize", "2");
    expect(articles[1]).toHaveAttribute("aria-posinset", "2");
  });

  it("uses a roving tabindex so only the first card is initially focusable", () => {
    const messages = [
      makeMessage({ id: "1", text: "First message" }),
      makeMessage({ id: "2", text: "Second message" }),
    ];

    render(<MessageList messages={messages} />);

    const articles = screen.getAllByRole("article");
    expect(articles[0]).toHaveAttribute("tabindex", "0");
    expect(articles[1]).toHaveAttribute("tabindex", "-1");
  });

  it("moves focus to the next card with ArrowDown", () => {
    const messages = [
      makeMessage({ id: "1", text: "First message" }),
      makeMessage({ id: "2", text: "Second message" }),
    ];

    render(<MessageList messages={messages} />);

    const articles = screen.getAllByRole("article");
    articles[0].focus();
    fireEvent.keyDown(articles[0], { key: "ArrowDown" });

    expect(articles[1]).toHaveFocus();
    expect(articles[1]).toHaveAttribute("tabindex", "0");
    expect(articles[0]).toHaveAttribute("tabindex", "-1");
  });

  it("renders an empty feed when there are no messages", () => {
    const messages: Message[] = [];

    render(<MessageList messages={messages} />);

    const feed = screen.getByRole("feed", { name: "Message history" });
    expect(within(feed).queryAllByRole("article")).toHaveLength(0);
  });

  it("does not announce the initial history in the live region", () => {
    const messages = [makeMessage({ id: "1", author: "Ada", text: "First message" })];

    render(<MessageList messages={messages} />);

    expect(screen.getByRole("log")).toHaveTextContent("");
  });

  it("announces a newly arrived incoming message in the live region", () => {
    const initial = [makeMessage({ id: "1", author: "Ada", text: "First message" })];

    const { rerender } = render(<MessageList messages={initial} />);

    rerender(
      <MessageList
        messages={[
          ...initial,
          makeMessage({ id: "2", author: "Grace", text: "Hi there" }),
        ]}
      />
    );

    expect(screen.getByRole("log")).toHaveTextContent(
      "New message from Grace: Hi there"
    );
  });

  it("does not announce your own outgoing messages", () => {
    const initial = [makeMessage({ id: "1", author: "Ada", text: "First message" })];

    const { rerender } = render(<MessageList messages={initial} />);

    rerender(
      <MessageList
        messages={[
          ...initial,
          makeMessage({ id: "2", author: "You", text: "My reply", isOutgoing: true }),
        ]}
      />
    );

    expect(screen.getByRole("log")).toHaveTextContent("");
  });
});
