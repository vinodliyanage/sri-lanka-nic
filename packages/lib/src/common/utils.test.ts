import { describe, it, expect } from "vitest";
import { resolveNICConfig } from "./utils";
import { ResolvedNICConfig } from "../core/nic.types";

describe("resolveNICConfig", () => {
  const defaults: ResolvedNICConfig = {
    minimumAge: 16,
    maximumAge: 100,
    minimumBirthYear: 1900,
    maximumBirthYear: 2024,
  };

  it("should return defaults when no options are provided", () => {
    const config = resolveNICConfig(defaults);
    expect(config).toEqual(defaults);
  });

  it("should override specific options", () => {
    const config = resolveNICConfig(defaults, { minimumAge: 18, maximumBirthYear: 2020 });
    expect(config.minimumAge).toBe(18);
    expect(config.maximumAge).toBe(100); // unchanged
    expect(config.minimumBirthYear).toBe(1900); // unchanged
    expect(config.maximumBirthYear).toBe(2020);
  });

  it("should handle undefined option values by falling back to defaults", () => {
    const config = resolveNICConfig(defaults, { minimumAge: undefined, maximumAge: 120 });
    expect(config.minimumAge).toBe(16);
    expect(config.maximumAge).toBe(120);
  });
});
