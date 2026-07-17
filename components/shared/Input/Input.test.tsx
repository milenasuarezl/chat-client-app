import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Input } from "./Input";
import styles from "./Input.module.css";
import utilStyles from "@/util/visuallyHidden.module.css";

describe("Input", () => {
  it("renders with an accessible label independent of placeholder", () => {
    render(<Input label="Type a message" placeholder="Message" />);

    expect(screen.getByLabelText("Type a message")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Message")).toBeInTheDocument();
  });

  it("visually hides the label when hideLabel is true", () => {
    render(<Input label="Type a message" hideLabel />);

    const label = screen.getByText("Type a message");
    expect(label).toHaveClass(utilStyles.visuallyHidden);
    expect(screen.getByLabelText("Type a message")).toBeInTheDocument();
  });

  it("shows the label when hideLabel is false", () => {
    render(<Input label="Type a message" />);

    const label = screen.getByText("Type a message");
    expect(label).toHaveClass(styles.label);
    expect(label).not.toHaveClass(utilStyles.visuallyHidden);
  });

  it("calls onChange when the user types", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<Input label="Type a message" value="" onChange={onChange} />);
    await user.type(screen.getByLabelText("Type a message"), "Hi");

    expect(onChange).toHaveBeenCalled();
  });

  it("is not editable when disabled", () => {
    render(<Input label="Type a message" disabled />);

    expect(screen.getByLabelText("Type a message")).toBeDisabled();
  });
});
