import { describe, it, expect } from "vitest";
import { NewNIC } from "./new";
import { daylk, Gender, NICType, errors, MINIMUM_LEGAL_AGE_TO_HAVE_NIC } from "../common";

describe("NewNIC", () => {
  const MALE_NIC = "200001501234"; // Male, born Jan 15 2000
  const FEMALE_NIC = "200051501234"; // Female, born Jan 15 2000 (day 15 + 500 = 515)
  const LEAP_NIC = "200006000010"; // Male, born Feb 29 2000 (day 60)

  describe("constructor & value", () => {
    it("should store the raw NIC string as .value", () => {
      const nic = new NewNIC(MALE_NIC);
      expect(nic.value).toBe(MALE_NIC);
    });

    it("should set .type to NICType.NEW", () => {
      const nic = new NewNIC(MALE_NIC);
      expect(nic.type).toBe(NICType.NEW);
    });
  });

  describe(".parts", () => {
    it("should extract the correct raw parts from a 12-digit NIC", () => {
      const nic = new NewNIC(MALE_NIC);
      const parts = nic.parts;

      expect(parts.year).toBe("2000");
      expect(parts.days).toBe("015");
      expect(parts.serial).toBe("0123");
      expect(parts.checkdigit).toBe("4");
      expect(parts.letter).toBeNull();
    });

    it("should cache parts on repeated access (referential equality)", () => {
      const nic = new NewNIC(MALE_NIC);
      const first = nic.parts;
      const second = nic.parts;

      expect(first).toBe(second);
    });
  });

  describe(".formatted", () => {
    it("should parse year and days as numbers", () => {
      const nic = new NewNIC(MALE_NIC);
      const f = nic.formatted;

      expect(f.year).toBe(2000);
      expect(f.days).toBe(15);
    });

    it("should detect Male gender when days <= 500", () => {
      const nic = new NewNIC(MALE_NIC);
      expect(nic.formatted.gender).toBe(Gender.MALE);
    });

    it("should detect Female gender and subtract 500 from days", () => {
      const nic = new NewNIC(FEMALE_NIC);
      const f = nic.formatted;

      expect(f.gender).toBe(Gender.FEMALE);
      expect(f.days).toBe(15); // 515 - 500
    });

    it("should cache the formatted result", () => {
      const nic = new NewNIC(MALE_NIC);
      expect(nic.formatted).toBe(nic.formatted);
    });
  });

  describe(".birthday", () => {
    it("should compute Jan 15 correctly", () => {
      const nic = new NewNIC(MALE_NIC);
      expect(nic.birthday).toEqual({ year: 2000, month: 1, day: 15 });
    });

    it("should compute Feb 29 in a leap year", () => {
      const nic = new NewNIC(LEAP_NIC);
      expect(nic.birthday).toEqual({ year: 2000, month: 2, day: 29 });
    });

    it("should compute Dec 31 in a non-leap year (day 365)", () => {
      const nic = new NewNIC("200136500000");
      expect(nic.birthday).toEqual({ year: 2001, month: 12, day: 31 });
    });

    it("should compute Dec 31 in a leap year (day 366)", () => {
      const nic = new NewNIC("200036600000");
      expect(nic.birthday).toEqual({ year: 2000, month: 12, day: 31 });
    });

    it("should compute Mar 1 correctly in a leap year (day 61)", () => {
      const nic = new NewNIC("200006100010");
      expect(nic.birthday).toEqual({ year: 2000, month: 3, day: 1 });
    });

    it("should compute Mar 1 correctly in a non-leap year (day 60)", () => {
      const nic = new NewNIC("200106000010");
      expect(nic.birthday).toEqual({ year: 2001, month: 3, day: 1 });
    });

    it("should handle Female birthday (days encoded with +500)", () => {
      const nic = new NewNIC(FEMALE_NIC);
      expect(nic.birthday).toEqual({ year: 2000, month: 1, day: 15 });
    });
  });

  describe(".gender", () => {
    it("should return MALE for a male NIC", () => {
      expect(new NewNIC(MALE_NIC).gender).toBe(Gender.MALE);
    });

    it("should return FEMALE for a female NIC", () => {
      expect(new NewNIC(FEMALE_NIC).gender).toBe(Gender.FEMALE);
    });
  });

  describe(".age", () => {
    it("should calculate age relative to current Sri Lankan date", () => {
      const nic = new NewNIC(MALE_NIC); // born Jan 15, 2000
      const now = daylk.now;

      let expectedAge = now.year - 2000;
      if (now.month < 1 || (now.month === 1 && now.day < 15)) {
        expectedAge--;
      }

      expect(nic.age).toBe(expectedAge);
    });
  });

  describe(".config", () => {
    it("should return default config for NewNIC", () => {
      const nic = new NewNIC(MALE_NIC);
      const config = nic.config;

      expect(config.minimumAge).toBe(MINIMUM_LEGAL_AGE_TO_HAVE_NIC);
      expect(config.minimumBirthYear).toBe(1900);
      expect(config.maximumBirthYear).toBe(daylk.now.year - MINIMUM_LEGAL_AGE_TO_HAVE_NIC);
      expect(config.maximumAge).toBe(daylk.now.year - 1900);
    });
  });

  describe(".convert() — New → Old", () => {
    it("should convert a 19XX NIC to old format with default letter V", () => {
      const nic = new NewNIC("199014004567");
      expect(nic.convert()).toBe("901404567V");
    });

    it("should respect { letter: 'X' } option", () => {
      const nic = new NewNIC("199014004567");
      expect(nic.convert({ letter: "X" })).toBe("901404567X");
    });

    it("should throw for year 20XX (cannot be represented in old format)", () => {
      const nic = new NewNIC("200001501234");
      expect(() => nic.convert()).toThrow(errors.INVALID_YEAR_FOR_OLD_FORMAT_CONVERSION);
    });

    it("should throw when serial doesn't start with '0'", () => {
      const nic = new NewNIC("199014012340");
      expect(() => nic.convert()).toThrow(errors.SERIAL_NUMBER_TOO_LARGE_FOR_OLD_FORMAT);
    });
  });

  describe(".toString()", () => {
    it("should return the raw NIC value", () => {
      const nic = new NewNIC(MALE_NIC);
      expect(nic.toString()).toBe(MALE_NIC);
      expect(`${nic}`).toBe(MALE_NIC);
    });
  });

  describe(".toJSON()", () => {
    it("should return a plain object with all parsed fields", () => {
      const nic = new NewNIC(MALE_NIC);
      const json = nic.toJSON();

      expect(json.value).toBe(MALE_NIC);
      expect(json.type).toBe(NICType.NEW);
      expect(json.gender).toBe(Gender.MALE);
      expect(json.birthday).toEqual({ year: 2000, month: 1, day: 15 });
      expect(typeof json.age).toBe("number");
      expect(json.parts).toBeDefined();
    });

    it("should be JSON.stringify-safe", () => {
      const nic = new NewNIC(MALE_NIC);
      const str = JSON.stringify(nic);
      const obj = JSON.parse(str);

      expect(obj.value).toBe(MALE_NIC);
      expect(obj.type).toBe(NICType.NEW);
    });
  });
});
