import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("renders its children", () => {
    render(<Button>Send</Button>);

    expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument();
  });

  it("defaults to type=\"button\"", () => {
    render(<Button>Send</Button>);

    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("calls onClick when pressed", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Button onClick={onClick}>Send</Button>);
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Button onClick={onClick} disabled>
        Send
      </Button>,
    );
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(onClick).not.toHaveBeenCalled();
  });
});
