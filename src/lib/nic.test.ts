import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NIC, NICType, Gender } from "./nic";
import { NICConfig } from "./nic-config";

describe("NIC Class", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Set a fixed date: 2026-02-28
    vi.setSystemTime(new Date(2026, 1, 28));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("Static Methods", () => {
    describe("validate()", () => {
      it("should return true for a valid New NIC", () => {
        const nic = "197419202757";
        const result = NIC.validate(nic);
        expect(result.valid).toBe(true);
      });

      it("should return true for a valid Old NIC with uppercase V", () => {
        const nic = "911042754V";
        const result = NIC.validate(nic);
        expect(result.valid).toBe(true);
      });

      it("should return true for a valid Old NIC with uppercase X", () => {
        const nic = "911042754X";
        const result = NIC.validate(nic);
        expect(result.valid).toBe(true);
      });

      it("should return true for a valid Old NIC with lowercase v", () => {
        const nic = "911042754v";
        const result = NIC.validate(nic);
        expect(result.valid).toBe(true);
      });

      it("should return true for a valid Old NIC with lowercase x", () => {
        const nic = "911042754x";
        const result = NIC.validate(nic);
        expect(result.valid).toBe(true);
      });

      it("should return true for a untrimmed valid Old NIC", () => {
        const nic = "   911042754x    ";
        const result = NIC.validate(nic);
        expect(result.valid).toBe(true);
      });

      it("should return true for a untrimmed valid New NIC", () => {
        const nic = "   197419202757    ";
        const result = NIC.validate(nic);
        expect(result.valid).toBe(true);
      });

      it("should return false for an invalid NIC structure", () => {
        const nic = "invalid123";
        const result = NIC.validate(nic);
        expect(result.valid).toBe(false);
        expect(result.error?.code).toBe("INVALID_NIC_STRUCTURE");
      });

      it("should return false for an invalid Old NIC structure (too short)", () => {
        const nic = "91104275V"; // 8 digits + V
        const result = NIC.validate(nic);
        expect(result.valid).toBe(false);
      });

      it("should return false for an invalid Old NIC structure (too long)", () => {
        const nic = "9110427545V"; // 10 digits + V
        const result = NIC.validate(nic);
        expect(result.valid).toBe(false);
      });

      it("should return false for an invalid New NIC structure (too long)", () => {
        const nic = "1974192027570"; // 13 digits
        const result = NIC.validate(nic);
        expect(result.valid).toBe(false);
      });

      it("should return false for an invalid New NIC structure (too short)", () => {
        const nic = "19741920275"; // 11 digits
        const result = NIC.validate(nic);
        expect(result.valid).toBe(false);
      });

      it("should return false when age requirement not met (too old)", () => {
        const nic = "190001502757"; // Year 1900, max age constraint
        const result = NIC.validate(nic);
        expect(result.valid).toBe(false);
        expect(result.error?.code).toBe("MAXIMUM_AGE_REQUIREMENT_NOT_MET");
      });

      it("should return false when minimum age requirement not met (too young)", () => {
        const currentYear = new Date().getFullYear();
        const futureYear = currentYear - NICConfig.MINIMUM_LEGAL_AGE_TO_HAVE_NIC + 1; // younger than 15
        const nic = `${futureYear}01502757`;
        const result = NIC.validate(nic);
        expect(result.valid).toBe(false);
        expect(result.error?.code).toBe("MINIMUM_AGE_REQUIREMENT_NOT_MET");
      });

      it("should return false for invalid day of year (0) in New NIC", () => {
        const nic = "199100002757";
        const result = NIC.validate(nic);
        expect(result.valid).toBe(false);
        expect(result.error?.code).toBe("INVALID_DAY_OF_YEAR");
      });

      it("should return false for an invalid day of birth year in Old NIC", () => {
        const nic = "910002754V";
        const result = NIC.validate(nic);
        expect(result.valid).toBe(false);
      });

      it("should return false for invalid day of year (male > 366 in leap year)", () => {
        const nic = "199636702757"; // 1996 is leap year
        const result = NIC.validate(nic);
        expect(result.valid).toBe(false);
        expect(result.error?.code).toBe("INVALID_DAY_OF_YEAR");
      });

      it("should return false for invalid day of year (male > 365 in non-leap year)", () => {
        const nic = "199536602757"; // 1995 is non-leap year
        const result = NIC.validate(nic);
        expect(result.valid).toBe(false);
        expect(result.error?.code).toBe("INVALID_DAY_OF_YEAR");
      });

      it("should return false for invalid day of year (female > 866 in leap year)", () => {
        const nic = "199686702757"; // 1996 is leap year + 500
        const result = NIC.validate(nic);
        expect(result.valid).toBe(false);
        expect(result.error?.code).toBe("INVALID_DAY_OF_YEAR");
      });

      it("should return true for female valid day in leap year (366)", () => {
        const nic = "199686602757"; // 366 + 500
        const result = NIC.validate(nic);
        expect(result.valid).toBe(true);
      });

      it("should return false for invalid day of year (female > 865 in non-leap year)", () => {
        const nic = "199586602757"; // 1995 is non-leap year + 500
        const result = NIC.validate(nic);
        expect(result.valid).toBe(false);
        expect(result.error?.code).toBe("INVALID_DAY_OF_YEAR");
      });

      it("should return true for female valid day in non-leap year (365)", () => {
        const nic = "199586502757"; // 365 + 500
        const result = NIC.validate(nic);
        expect(result.valid).toBe(true);
      });
    });

    describe("valid()", () => {
      it("should return true for a valid NIC", () => {
        expect(NIC.valid("197419202757")).toBe(true);
      });

      it("should return false for an invalid NIC", () => {
        expect(NIC.valid("invalid")).toBe(false);
      });
    });

    describe("sanitize()", () => {
      it("should return sanitized uppercase NIC", () => {
        expect(NIC.sanitize(" 911042754v ")).toBe("911042754V");
      });

      it("should throw an error for invalid NIC", () => {
        expect(() => NIC.sanitize("invalid")).toThrow("Invalid NIC structure");
      });
    });

    describe("parse()", () => {
      it("should throw an error for invalid NIC", () => {
        expect(() => NIC.parse("invalid")).toThrow("Invalid NIC structure");
      });

      it("should return a NIC instance for a valid old NIC", () => {
        const nicStr = "911042754V";
        const nic = NIC.parse(nicStr);
        expect(nic).toBeInstanceOf(NIC);
        expect(nic.value).toBe("911042754V");
        expect(nic.type).toBe(NICType.OLD);
        expect(nic.gender).toBe(Gender.MALE);
      });

      it("should return a NIC instance for a valid new NIC", () => {
        const nicStr = "197419202757";
        const nic = NIC.parse(nicStr);
        expect(nic).toBeInstanceOf(NIC);
        expect(nic.value).toBe("197419202757");
        expect(nic.type).toBe(NICType.NEW);
        expect(nic.gender).toBe(Gender.MALE);
      });

      it("should return female gender correctly", () => {
        const nic = NIC.parse("197469202757"); // 192 (male) + 500 (female) = 692
        expect(nic.gender).toBe(Gender.FEMALE);
      });
    });
  });

  describe("Instance Properties & Methods", () => {
    describe("get birthday", () => {
      it("should compute birthday correctly for a non-leap year", () => {
        const nic = NIC.parse("199515102757"); // 151st day
        expect(nic.birthday).toEqual({ year: 1995, month: 5, day: 31 }); // May 31
      });

      it("should compute birthday correctly for a leap year", () => {
        const nic = NIC.parse("199615202757"); // 152nd day
        expect(nic.birthday).toEqual({ year: 1996, month: 5, day: 31 }); // May 31
      });

      it("should compute birthday correctly for first day of year", () => {
        const nic = NIC.parse("199500102757"); // 1st day
        expect(nic.birthday).toEqual({ year: 1995, month: 1, day: 1 });
      });

      it("should compute birthday correctly for last day of the non-leap year", () => {
        const nic = NIC.parse("199536502757"); // 365th day
        expect(nic.birthday).toEqual({ year: 1995, month: 12, day: 31 });
      });

      it("should compute birthday correctly for last day of the leap year", () => {
        const nic = NIC.parse("199636602757"); // 366th day
        expect(nic.birthday).toEqual({ year: 1996, month: 12, day: 31 });
      });

      it("should handle day exact match on month end", () => {
        const nic = NIC.parse("199503102757"); // 31st day
        expect(nic.birthday).toEqual({ year: 1995, month: 1, day: 31 });
      });
    });

    describe("get age", () => {
      it("should compute age correctly (birthday already passed)", () => {
        // Mock current date is 2026-02-28
        const nic = NIC.parse("199500102757"); // Birthday Jan 1, 1995
        expect(nic.age).toBe(31); // 2026 - 1995 = 31
      });

      it("should compute age correctly (birthday is today)", () => {
        const nic = NIC.parse("199505902757"); // Birthday Feb 28, 1995 (non-leap year, 59th day)
        expect(nic.age).toBe(31);
      });

      it("should compute age correctly (birthday in same month but future day)", () => {
        vi.setSystemTime(new Date(2026, 1, 15)); // Feb 15, 2026
        const nic = NIC.parse("199505902757"); // Birthday Feb 28
        expect(nic.age).toBe(30);
      });

      it("should compute age correctly (birthday in future month)", () => {
        const nic = NIC.parse("199536502757"); // Birthday Dec 31
        expect(nic.age).toBe(30);
      });
    });

    describe("get voter", () => {
      it("should return null for new NIC", () => {
        const nic = NIC.parse("197419202757");
        expect(nic.voter).toBeNull();
      });

      it("should return true for old NIC with V", () => {
        const nic = NIC.parse("911042754V");
        expect(nic.voter).toBe(true);
      });

      it("should return false for old NIC with X", () => {
        const nic = NIC.parse("911042754X");
        expect(nic.voter).toBe(false);
      });

      it("should return true for old NIC with lowercase v", () => {
        const nic = NIC.parse("911042754v");
        expect(nic.voter).toBe(true);
      });

      it("should return false for old NIC with lowercase x", () => {
        const nic = NIC.parse("911042754x");
        expect(nic.voter).toBe(false);
      });
    });

    describe("convert()", () => {
      it("should convert OLD to NEW format", () => {
        const nic = NIC.parse("911042754V");
        expect(nic.convert()).toBe("199110402754");
      });

      it("should convert NEW to OLD format (19xx year and valid serial)", () => {
        const nic = NIC.parse("199110402754");
        expect(nic.convert()).toBe("911042754V");
      });

      it("should throw error when converting NEW to OLD format if year is not 19xx", () => {
        const nic = NIC.parse("200010402754"); // Year 2000
        expect(() => nic.convert()).toThrow("Only 19xx born NICs can be converted to the OLD format");
      });

      it("should throw error when converting NEW to OLD format if serial is too large", () => {
        // Serial 1234 (does not start with 0)
        const nicStr = "199110412344";
        const nic = NIC.parse(nicStr);
        expect(() => nic.convert()).toThrow('The serial number "1234" in this new-format NIC is too large');
      });
    });

    describe("toJSON() and toString()", () => {
      it("toString() should return the NIC value", () => {
        const nicStr = "197419202757";
        const nic = NIC.parse(nicStr);
        expect(nic.toString()).toBe(nicStr);
      });

      it("toJSON() should return structured data", () => {
        const nic = NIC.parse("197419202757");
        const json = nic.toJSON();

        expect(json).toMatchObject({
          nic: "197419202757",
          type: NICType.NEW,
          gender: Gender.MALE,
          age: expect.any(Number),
          voter: null,
        });
        expect(json.birthday).toEqual({ year: 1974, month: 7, day: 11 }); // 192nd day 1974
        expect(json.parts).toEqual({
          year: "1974",
          days: "192",
          serial: "0275",
          checkdigit: "7",
          letter: null,
        });
      });

      it("toJSON() should return structured data for OLD NIC", () => {
        const nic = NIC.parse("911042754V");
        const json = nic.toJSON();

        expect(json).toMatchObject({
          nic: "911042754V",
          type: NICType.OLD,
          gender: Gender.MALE,
          age: expect.any(Number),
          voter: true,
        });
        expect(json.parts).toEqual({
          year: "1991",
          days: "104",
          serial: "275",
          checkdigit: "4",
          letter: "V",
        });
      });
    });
  });
});
