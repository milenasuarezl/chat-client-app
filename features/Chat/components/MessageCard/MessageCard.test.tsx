import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MessageCard } from "./MessageCard";
import utilStyles from "@/utils/visuallyHidden.module.css";
import type { Message } from "@/lib/types";

const makeMessage = (overrides: Partial<Message> = {}): Message => ({
  id: "1",
  author: "Ada",
  text: "Hello there",
  timestamp: "2026-07-19T09:05:00.000Z",
  isOutgoing: false,
  ...overrides,
});

describe("MessageCard", () => {
  it("renders the message text", () => {
    const message = makeMessage({ text: "Hello there" });

    render(<MessageCard message={message} />);

    expect(screen.getByText("Hello there")).toBeInTheDocument();
  });

  it("shows the author for received messages", () => {

    const message = makeMessage({ author: "Ada", isOutgoing: false });

    render(<MessageCard message={message} />);

    const author = screen.getByText("Ada");
    expect(author).toBeInTheDocument();
    expect(author).not.toHaveClass(utilStyles.visuallyHidden);
  });

  it("exposes the sender to assistive tech but hides it visually for outgoing messages", () => {
    const message = makeMessage({ author: "Barbara", isOutgoing: true });

    render(<MessageCard message={message} />);

    const sender = screen.getByText("You");
    expect(sender).toBeInTheDocument();
    expect(sender).toHaveClass(utilStyles.visuallyHidden);
    expect(screen.queryByText("Barbara")).not.toBeInTheDocument();
  });

  it("names the card after its sender via aria-labelledby", () => {
    const message = makeMessage({ author: "Ada", isOutgoing: false });

    render(<MessageCard message={message} />);

    expect(screen.getByRole("article", { name: "Ada" })).toBeInTheDocument();
  });

  it("renders the formatted timestamp", () => {

    const message = makeMessage({ timestamp: "2026-07-19T09:05:00.000Z" });

    render(<MessageCard message={message} />);

    const time = screen.getByText("19 Jul 2026 9:05");
    expect(time).toHaveAttribute("dateTime", message.timestamp);
  });
});
