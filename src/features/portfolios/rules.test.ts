import { describe, expect, it } from "vitest";
import { DESCRIPTION_MAX, NAME_MAX, validatePortfolio } from "./rules";

describe("validatePortfolio", () => {
  it("accepts a name and an empty description", () => {
    expect(validatePortfolio({ name: "Long term", description: "" })).toEqual({});
  });

  it("requires a name that is not only spaces", () => {
    expect(validatePortfolio({ name: "   ", description: "" }).name).toBeDefined();
  });

  it("accepts the length limits and rejects one character more", () => {
    const atLimit = { name: "ก".repeat(NAME_MAX), description: "ข".repeat(DESCRIPTION_MAX) };
    expect(validatePortfolio(atLimit)).toEqual({});
    expect(validatePortfolio({ ...atLimit, name: atLimit.name + "ก" }).name).toBeDefined();
    expect(validatePortfolio({ ...atLimit, description: atLimit.description + "ข" }).description).toBeDefined();
  });
});
