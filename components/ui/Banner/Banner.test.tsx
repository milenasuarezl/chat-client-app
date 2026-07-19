import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Banner } from "./Banner";

describe("Banner", () => {
  it("renders its children with an alert role", () => {
    render(<Banner>Something went wrong</Banner>);

    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong");
  });

  it("renders the action button and calls its handler when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Banner action={{ label: "Retry", onClick }}>Failed to send</Banner>,
    );
    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders a dismiss button and calls onDismiss when clicked", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();

    render(<Banner onDismiss={onDismiss}>Heads up</Banner>);
    await user.click(
      screen.getByRole("button", { name: "Dismiss notification" }),
    );

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("does not render action or dismiss buttons by default", () => {
    render(<Banner>Just a message</Banner>);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
