import { describe, expect, it } from "vitest";

import { formatTimestamp } from "./utils";

describe("formatTimestamp", () => {
  it("formats an ISO timestamp as '10 Mar 2018 9:55'", () => {
    expect(formatTimestamp("2018-03-10T09:55:00Z")).toBe("10 Mar 2018 9:55");
  });

  it("zero-pads the minutes", () => {
    expect(formatTimestamp("2018-03-10T09:05:00Z")).toBe("10 Mar 2018 9:05");
  });

  it("uses UTC regardless of the local timezone", () => {
    expect(formatTimestamp("2018-12-31T23:30:00Z")).toBe("31 Dec 2018 23:30");
  });
});
