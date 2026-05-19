import { describe, it, expect } from "vitest";
import { OldNIC } from "./old";
import { NewNIC } from "./new";
import { daylk, Gender, NICType, MINIMUM_LEGAL_AGE_TO_HAVE_NIC } from "../common";

describe("OldNIC", () => {
  const MALE_NIC = "901404567V"; // Male, born May 19 1990 (day 140), voter
  const FEMALE_NIC = "906404567V"; // Female: 140 + 500 = 640, born May 19 1990
  const NON_VOTER_NIC = "901404567X";

  describe("constructor & value", () => {
    it("should store the raw NIC string as .value", () => {
      const nic = new OldNIC(MALE_NIC);
      expect(nic.value).toBe(MALE_NIC);
    });

    it("should set .type to NICType.OLD", () => {
      const nic = new OldNIC(MALE_NIC);
      expect(nic.type).toBe(NICType.OLD);
    });
  });

  describe(".parts", () => {
    it("should extract correct raw parts, prepending '19' to year", () => {
      const nic = new OldNIC(MALE_NIC);
      const parts = nic.parts;

      expect(parts.year).toBe("1990"); // "90" → "1990"
      expect(parts.days).toBe("140");
      expect(parts.serial).toBe("456");
      expect(parts.checkdigit).toBe("7");
      expect(parts.letter).toBe("V");
    });

    it("should cache parts on repeated access", () => {
      const nic = new OldNIC(MALE_NIC);
      expect(nic.parts).toBe(nic.parts);
    });
  });

  describe(".formatted", () => {
    it("should detect Male when days <= 500", () => {
      const nic = new OldNIC(MALE_NIC);
      expect(nic.formatted.gender).toBe(Gender.MALE);
      expect(nic.formatted.days).toBe(140);
    });

    it("should detect Female and subtract 500 from days", () => {
      const nic = new OldNIC(FEMALE_NIC);
      expect(nic.formatted.gender).toBe(Gender.FEMALE);
      expect(nic.formatted.days).toBe(140); // 640 - 500
    });
  });

  describe(".birthday", () => {
    it("should compute birthday from old-format days", () => {
      const nic = new OldNIC(MALE_NIC);
      // NIC system always treats Feb=29, so day 140 = May 19 in every year.
      expect(nic.birthday).toEqual({ year: 1990, month: 5, day: 19 });
    });

    it("should compute Jan 1 correctly (day 1)", () => {
      const nic = new OldNIC("900010000V"); // day 001, year 1990
      expect(nic.birthday).toEqual({ year: 1990, month: 1, day: 1 });
    });
  });

  describe(".gender", () => {
    it("should return MALE for a male NIC", () => {
      expect(new OldNIC(MALE_NIC).gender).toBe(Gender.MALE);
    });

    it("should return FEMALE for a female NIC", () => {
      expect(new OldNIC(FEMALE_NIC).gender).toBe(Gender.FEMALE);
    });
  });

  describe(".age", () => {
    it("should calculate age relative to current Sri Lankan date", () => {
      const nic = new OldNIC(MALE_NIC); // born May 19, 1990
      const now = daylk.now;

      let expectedAge = now.year - 1990;
      if (now.month < 5 || (now.month === 5 && now.day < 19)) {
        expectedAge--;
      }

      expect(nic.age).toBe(expectedAge);
    });
  });

  describe(".config", () => {
    it("should return default config for OldNIC", () => {
      const nic = new OldNIC(MALE_NIC);
      const config = nic.config;

      expect(config.minimumAge).toBe(MINIMUM_LEGAL_AGE_TO_HAVE_NIC);
      expect(config.minimumBirthYear).toBe(1900);
      expect(config.maximumBirthYear).toBe(1999);
      expect(config.maximumAge).toBe(daylk.now.year - 1900);
    });
  });

  describe(".convert() — Old → New", () => {
    it("should convert to 12-digit new format with '0' prefix on serial", () => {
      const nic = new OldNIC(MALE_NIC);
      // "90" → "1990", days "140", serial "0" + "456", checkdigit "7"
      expect(nic.convert()).toBe("199014004567");
    });

    it("should produce a new-format NIC that parses to the same person", () => {
      const old = new OldNIC(MALE_NIC);
      const newNicStr = old.convert();
      const newNic = new NewNIC(newNicStr);

      expect(newNic.birthday).toEqual(old.birthday);
      expect(newNic.gender).toBe(old.gender);
    });
  });

  describe(".toString()", () => {
    it("should return the raw NIC value", () => {
      const nic = new OldNIC(MALE_NIC);
      expect(nic.toString()).toBe(MALE_NIC);
      expect(`${nic}`).toBe(MALE_NIC);
    });
  });

  describe(".toJSON()", () => {
    it("should return a serializable object with voter letter", () => {
      const nic = new OldNIC(MALE_NIC);
      const json = nic.toJSON();

      expect(json.value).toBe(MALE_NIC);
      expect(json.type).toBe(NICType.OLD);
      expect(json.parts.letter).toBe("V");
    });
  });
});
