import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MessageComposer } from "./MessageComposer";

describe("MessageComposer", () => {
  it("renders the input and send button", () => {
    render(<MessageComposer onSend={vi.fn()} />);

    expect(screen.getByLabelText("Type a message")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument();
  });

  it("disables the send button when the input is empty", () => {
    render(<MessageComposer onSend={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
  });

  it("enables the send button once the user types", async () => {
    const user = userEvent.setup();

    render(<MessageComposer onSend={vi.fn()} />);
    await user.type(screen.getByLabelText("Type a message"), "Hello");

    expect(screen.getByRole("button", { name: "Send" })).toBeEnabled();
  });

  it("keeps the send button disabled for whitespace-only input", async () => {
    const user = userEvent.setup();

    render(<MessageComposer onSend={vi.fn()} />);
    await user.type(screen.getByLabelText("Type a message"), "   ");

    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
  });

  it("calls onSend with the trimmed text on submit", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();

    render(<MessageComposer onSend={onSend} />);
    await user.type(screen.getByLabelText("Type a message"), "  Hi there  ");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(onSend).toHaveBeenCalledTimes(1);
    expect(onSend).toHaveBeenCalledWith("Hi there");
  });

  it("clears the input after a successful send", async () => {
    const user = userEvent.setup();

    render(<MessageComposer onSend={vi.fn()} />);
    const input = screen.getByLabelText("Type a message");
    await user.type(input, "Hello");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(input).toHaveValue("");
  });

  it("does not call onSend when the message is empty", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();

    render(<MessageComposer onSend={onSend} />);
    await user.type(screen.getByLabelText("Type a message"), "{Enter}");

    expect(onSend).not.toHaveBeenCalled();
  });
});
