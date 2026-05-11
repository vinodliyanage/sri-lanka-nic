import { describe, it, expect } from "vitest";
import { daylk } from "./daylk";

describe("daylk", () => {
  describe(".isLeap()", () => {
    it("should return true for divisible-by-4 years", () => {
      expect(daylk.isLeap(2000)).toBe(true);
      expect(daylk.isLeap(2004)).toBe(true);
      expect(daylk.isLeap(1996)).toBe(true);
    });

    it("should return false for century years not divisible by 400", () => {
      expect(daylk.isLeap(1900)).toBe(false);
      expect(daylk.isLeap(2100)).toBe(false);
    });

    it("should return true for century years divisible by 400", () => {
      expect(daylk.isLeap(2000)).toBe(true);
      expect(daylk.isLeap(2400)).toBe(true);
    });

    it("should return false for non-leap years", () => {
      expect(daylk.isLeap(2001)).toBe(false);
      expect(daylk.isLeap(2023)).toBe(false);
    });
  });

  describe(".totalDaysInYear()", () => {
    it("should return 366 for leap years", () => {
      expect(daylk.totalDaysInYear(2000)).toBe(366);
      expect(daylk.totalDaysInYear(2004)).toBe(366);
    });

    it("should return 365 for non-leap years", () => {
      expect(daylk.totalDaysInYear(2001)).toBe(365);
      expect(daylk.totalDaysInYear(1900)).toBe(365);
    });
  });

  describe(".dayOfYear()", () => {
    it("should return 1 for Jan 1", () => {
      expect(daylk.dayOfYear(2000, 1, 1)).toBe(1);
    });

    it("should return 31 for Jan 31", () => {
      expect(daylk.dayOfYear(2000, 1, 31)).toBe(31);
    });

    it("should return 32 for Feb 1", () => {
      expect(daylk.dayOfYear(2000, 2, 1)).toBe(32);
    });

    it("should return 60 for Feb 29 in a leap year", () => {
      expect(daylk.dayOfYear(2000, 2, 29)).toBe(60);
    });

    it("should return 60 for Mar 1 in a non-leap year", () => {
      expect(daylk.dayOfYear(2001, 3, 1)).toBe(60);
    });

    it("should return 61 for Mar 1 in a leap year (leap offset)", () => {
      expect(daylk.dayOfYear(2000, 3, 1)).toBe(61);
    });

    it("should return 365 for Dec 31 in a non-leap year", () => {
      expect(daylk.dayOfYear(2001, 12, 31)).toBe(365);
    });

    it("should return 366 for Dec 31 in a leap year", () => {
      expect(daylk.dayOfYear(2000, 12, 31)).toBe(366);
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
