import { describe, expect, it } from "vitest";

import { sanitizeExcelFilenamePart } from "./excel-session-results";

describe("sanitizeExcelFilenamePart", () => {
  it("removes forbidden path characters", () => {
    expect(sanitizeExcelFilenamePart('Midterm \\ Final: A/B')).toBe(
      "Midterm _ Final_ A_B",
    );
  });

  it("falls back when trim is empty", () => {
    expect(sanitizeExcelFilenamePart("   ")).toBe("session");
  });
});
