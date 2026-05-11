import { describe, it, expect } from "vitest";
import { NICError } from "./error";

describe("NICError", () => {
  it("should be an instance of Error", () => {
    const err = new NICError("test");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(NICError);
  });

  it("should have .name set to 'NICError'", () => {
    const err = new NICError("test message");
    expect(err.name).toBe("NICError");
  });

  it("should preserve the message", () => {
    const err = new NICError("something went wrong");
    expect(err.message).toBe("something went wrong");
  });

  it("should survive instanceof checks across prototype chain fix", () => {
    try {
      throw new NICError("catch me");
    } catch (e) {
      expect(e).toBeInstanceOf(NICError);
      expect(e).toBeInstanceOf(Error);
    }
  });
});
