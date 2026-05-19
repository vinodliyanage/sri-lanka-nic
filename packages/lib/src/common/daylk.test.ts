import { describe, it, expect } from "vitest";
import { daylk } from "./daylk";

describe("daylk", () => {
  describe(".dayOfYear()", () => {
    it("should return 1 for Jan 1", () => {
      expect(daylk.dayOfYear(1, 1)).toBe(1);
    });

    it("should return 31 for Jan 31", () => {
      expect(daylk.dayOfYear(1, 31)).toBe(31);
    });

    it("should return 32 for Feb 1", () => {
      expect(daylk.dayOfYear(2, 1)).toBe(32);
    });

    it("should return 60 for Feb 29 (NIC system always treats Feb as 29 days)", () => {
      expect(daylk.dayOfYear(2, 29)).toBe(60);
    });

    it("should return 61 for Mar 1 (Feb is always 29 days)", () => {
      expect(daylk.dayOfYear(3, 1)).toBe(61);
    });

    it("should return 366 for Dec 31", () => {
      expect(daylk.dayOfYear(12, 31)).toBe(366);
    });
  });

  describe(".now", () => {
    it("should return year, month, and day as numbers", () => {
      const now = daylk.now;
      expect(typeof now.year).toBe("number");
      expect(typeof now.month).toBe("number");
      expect(typeof now.day).toBe("number");
    });

    it("should return sensible date ranges", () => {
      const now = daylk.now;
      expect(now.year).toBeGreaterThanOrEqual(2020);
      expect(now.month).toBeGreaterThanOrEqual(1);
      expect(now.month).toBeLessThanOrEqual(12);
      expect(now.day).toBeGreaterThanOrEqual(1);
      expect(now.day).toBeLessThanOrEqual(31);
    });
  });
});
