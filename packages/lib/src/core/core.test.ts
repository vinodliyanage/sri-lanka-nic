import { describe, it, expect } from "vitest";
import { NewNIC } from "./new-nic";
import { OldNIC } from "./old-nic";
import { NICValidator } from "./nic.validator";
import { NIC } from "./nic";
import { daylk, Gender, NICType, NICError, errors, MINIMUM_LEGAL_AGE_TO_HAVE_NIC } from "../common";

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

describe("OldNIC", () => {
  const MALE_NIC = "901404567V"; // Male, born May 20 1990, voter
  const FEMALE_NIC = "906404567V"; // Female: 140 + 500 = 640, born May 20 1990
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
      // 1990 is not a leap year. Day 140 = May 20.
      expect(nic.birthday).toEqual({ year: 1990, month: 5, day: 20 });
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
      const nic = new OldNIC(MALE_NIC); // born May 20, 1990
      const now = daylk.now;

      let expectedAge = now.year - 1990;
      if (now.month < 5 || (now.month === 5 && now.day < 20)) {
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

// ─── NICValidator ───────────────────────────────────────────────────────────────

describe("NICValidator", () => {
  describe(".sanitize()", () => {
    it("should trim whitespace and uppercase", () => {
      expect(NICValidator.sanitize("  901404567v  ")).toBe("901404567V");
    });

    it("should handle already clean input", () => {
      expect(NICValidator.sanitize("901404567V")).toBe("901404567V");
    });

    it("should handle mixed-case 12-digit NICs", () => {
      expect(NICValidator.sanitize("200001501234")).toBe("200001501234");
    });
  });

  describe(".getType()", () => {
    it("should return NEW for 12-digit strings", () => {
      expect(NICValidator.getType("200001501234")).toBe(NICType.NEW);
    });

    it("should return OLD for 9-digit + V", () => {
      expect(NICValidator.getType("901404567V")).toBe(NICType.OLD);
    });

    it("should return OLD for 9-digit + X", () => {
      expect(NICValidator.getType("901404567X")).toBe(NICType.OLD);
    });

    it("should auto-sanitize before checking (lowercase + spaces)", () => {
      expect(NICValidator.getType("  901404567v  ")).toBe(NICType.OLD);
    });

    it("should throw NICError for invalid structures", () => {
      expect(() => NICValidator.getType("")).toThrow(NICError);
      expect(() => NICValidator.getType("abc")).toThrow(NICError);
      expect(() => NICValidator.getType("12345")).toThrow(NICError);
      expect(() => NICValidator.getType("12345678A")).toThrow(NICError); // not V or X
      expect(() => NICValidator.getType("1234567890123")).toThrow(NICError); // 13 digits
    });

    it("should throw with the correct error message", () => {
      expect(() => NICValidator.getType("invalid")).toThrow(errors.INVALID_NIC_STRUCTURE);
    });
  });

  describe(".validate()", () => {
    it("should pass for a valid NewNIC", () => {
      const nic = new NewNIC("200001501234");
      expect(() => NICValidator.validate(nic)).not.toThrow();
    });

    it("should pass for a valid OldNIC", () => {
      const nic = new OldNIC("901404567V");
      expect(() => NICValidator.validate(nic)).not.toThrow();
    });

    it("should throw INVALID_DAY_OF_YEAR for day 0", () => {
      const nic = new NewNIC("200000001230");
      expect(() => NICValidator.validate(nic)).toThrow(errors.INVALID_DAY_OF_YEAR);
    });

    it("should throw INVALID_DAY_OF_YEAR for day > 366 in a leap year", () => {
      // 2000 is a leap year, max day = 366. Day 367 is invalid.
      const nic = new NewNIC("200036700000");
      expect(() => NICValidator.validate(nic)).toThrow(errors.INVALID_DAY_OF_YEAR);
    });

    it("should throw INVALID_DAY_OF_YEAR for day > 365 in a non-leap year", () => {
      // 2001 is not a leap year, so day 366 is invalid.
      const nic = new NewNIC("200136600000");
      expect(() => NICValidator.validate(nic)).toThrow(errors.INVALID_DAY_OF_YEAR);
    });

    it("should accept day 366 in a leap year", () => {
      // 2000 is a leap year. Day 366 = Dec 31.
      const nic = new NewNIC("200036600000");
      expect(() => NICValidator.validate(nic)).not.toThrow();
    });

    it("should accept day 365 in a non-leap year", () => {
      const nic = new NewNIC("200136500000");
      expect(() => NICValidator.validate(nic)).not.toThrow();
    });

    describe("age constraints", () => {
      it("should throw MINIMUM_AGE_REQUIREMENT_NOT_MET for too-young NIC", () => {
        // Person born this year would be age ≈ 0
        const thisYear = daylk.now.year;
        const nic = new NewNIC(`${thisYear}0010000000`);
        expect(() => NICValidator.validate(nic)).toThrow(errors.MINIMUM_AGE_REQUIREMENT_NOT_MET);
      });

      it("should allow overriding minimumAge via config", () => {
        const nic = new NewNIC("200001501234", { minimumAge: 50 }); // person born in 2000, age ~25
        expect(() => NICValidator.validate(nic)).toThrow(errors.MINIMUM_AGE_REQUIREMENT_NOT_MET);
      });

      it("should allow overriding maximumAge via config", () => {
        const nic = new OldNIC("500011234V", { maximumAge: 30 }); // person born in 1950, age ~75
        expect(() => NICValidator.validate(nic)).toThrow(errors.MAXIMUM_AGE_REQUIREMENT_NOT_MET);
      });
    });

    describe("birth year constraints", () => {
      it("should allow overriding minimumBirthYear via config", () => {
        const nic = new OldNIC("500011234V", { minimumBirthYear: 1980 }); // born 1950
        expect(() => NICValidator.validate(nic)).toThrow(errors.MAXIMUM_AGE_REQUIREMENT_NOT_MET);
      });

      it("should allow overriding maximumBirthYear via config", () => {
        const nic = new NewNIC("200001501234", { maximumBirthYear: 1990 }); // born 2000
        expect(() => NICValidator.validate(nic)).toThrow(errors.MINIMUM_AGE_REQUIREMENT_NOT_MET);
      });
    });

    describe("custom check callback", () => {
      it("should call the check function with the NIC instance and NICError class", () => {
        const nic = new NewNIC("200001501234");

        expect(() =>
          NICValidator.validate(nic, {
            check(parsed, Err) {
              expect(parsed.gender).toBe(Gender.MALE);
              expect(Err).toBe(NICError);
            },
          }),
        ).not.toThrow();
      });

      it("should propagate errors thrown by the check function", () => {
        const nic = new NewNIC("200001501234");

        expect(() =>
          NICValidator.validate(nic, {
            check(_, Err) {
              throw new Err("Custom validation failed");
            },
          }),
        ).toThrow("Custom validation failed");
      });

      it("should run check after built-in validation passes", () => {
        // day 0 is invalid — the check function should never be called.
        const nic = new NewNIC("200000001230");
        let checkCalled = false;

        expect(() =>
          NICValidator.validate(nic, {
            check() {
              checkCalled = true;
            },
          }),
        ).toThrow(NICError);

        expect(checkCalled).toBe(false);
      });
    });
  });
});

// ─── NIC API (the public facade) ────────────────────────────────────────────────

describe("NIC (public API)", () => {
  describe(".parse()", () => {
    it("should auto-sanitize input (trim + uppercase)", () => {
      const parsed = NIC.parse("  901404567v  ");
      expect(parsed.value).toBe("901404567V");
      expect(parsed.type).toBe(NICType.OLD);
    });

    it("should return a PublicNIC with all expected properties", () => {
      const parsed = NIC.parse("901404567V");

      expect(parsed).toHaveProperty("value");
      expect(parsed).toHaveProperty("type");
      expect(parsed).toHaveProperty("gender");
      expect(parsed).toHaveProperty("birthday");
      expect(parsed).toHaveProperty("age");
      expect(parsed).toHaveProperty("parts");
      expect(parsed).toHaveProperty("convert");
    });

    it("should throw for invalid NICs", () => {
      expect(() => NIC.parse("invalid")).toThrow(NICError);
    });
  });

  describe(".validate()", () => {
    it("should not return anything on success (void)", () => {
      const result = NIC.validate("901404567V");
      expect(result).toBeUndefined();
    });
  });

  describe(".valid()", () => {
    it("should swallow NICError and return false", () => {
      expect(NIC.valid("nope")).toBe(false);
    });

    it("should return true for valid NICs", () => {
      expect(NIC.valid("901404567V")).toBe(true);
    });

    it("should re-throw non-NICError exceptions from custom check", () => {
      expect(() =>
        NIC.valid("901404567V", {
          check() {
            throw new TypeError("not a NICError");
          },
        }),
      ).toThrow(TypeError);
    });
  });

  describe(".builder", () => {
    it("should return an object with .new() and .old() factory methods", () => {
      const builder = NIC.builder;
      expect(typeof builder.new).toBe("function");
      expect(typeof builder.old).toBe("function");
    });

    it("should forward config to the builder", () => {
      // If we pass minimumAge: 99, build should fail for a young NIC
      expect(() =>
        NIC.builder
          .new({ minimumAge: 99 })
          .birthday({ year: 2005, month: 1, day: 1 })
          .gender(Gender.MALE)
          .serial("000")
          .checkdigit("0")
          .build(),
      ).toThrow(NICError);
    });
  });

  describe(".random()", () => {
    it("should return a string", () => {
      expect(typeof NIC.random()).toBe("string");
    });

    it("should always be parseable", () => {
      for (let i = 0; i < 20; i++) {
        expect(() => NIC.parse(NIC.random())).not.toThrow();
      }
    });
  });
});

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
