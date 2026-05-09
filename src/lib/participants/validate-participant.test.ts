import { describe, expect, it } from "vitest";

import { validateParticipantIdentity } from "./validate-participant";

describe("validateParticipantIdentity", () => {
  it("returns error when all identity fields are empty", () => {
    expect(
      validateParticipantIdentity({
        name: "",
        universityId: "",
        email: "",
      }),
    ).toBe("participant.validation.identityRequired");
  });

  it("returns null when name is present", () => {
    expect(
      validateParticipantIdentity({
        name: "Ada",
        universityId: "",
        email: "",
      }),
    ).toBeNull();
  });

  it("accepts whitespace-only trimmed away as invalid", () => {
    expect(
      validateParticipantIdentity({
        name: "   ",
        universityId: "\t",
        email: "",
      }),
    ).toBe("participant.validation.identityRequired");
  });
});
