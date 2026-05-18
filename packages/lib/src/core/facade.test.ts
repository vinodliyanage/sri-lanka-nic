import { describe, it, expect } from "vitest";
import { NIC } from "./facade";
import { daylk, Gender, NICType, MINIMUM_LEGAL_AGE_TO_HAVE_NIC, NICError } from "../common";

// ─── NIC.random() ───────────────────────────────────────────────────────────────

describe("NIC.random()", () => {
  it("should return a string", () => {
    expect(typeof NIC.random()).toBe("string");
  });

  it("should always produce a valid NIC", () => {
    for (let i = 0; i < 50; i++) {
      const nic = NIC.random();
      expect(() => NIC.validate(nic)).not.toThrow();
    }
  });

  it("should produce both OLD and NEW types over many iterations", () => {
    const types = new Set<NICType>();

    for (let i = 0; i < 100; i++) {
      types.add(NIC.getType(NIC.random()));
      if (types.size === 2) break;
    }

    expect(types.has(NICType.OLD)).toBe(true);
    expect(types.has(NICType.NEW)).toBe(true);
  });
});

// ─── NIC.parse() ────────────────────────────────────────────────────────────────

describe("NIC.parse()", () => {
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

  describe("new format", () => {
    it("should parse a known new-format NIC", () => {
      const parsed = NIC.parse("200001501234");

      expect(parsed.type).toBe(NICType.NEW);
      expect(parsed.value).toBe("200001501234");
      expect(parsed.gender).toBe(Gender.MALE);
      expect(parsed.birthday).toEqual({ year: 2000, month: 1, day: 15 });
      expect(parsed.parts.year).toBe("2000");
      expect(parsed.parts.days).toBe("015");
      expect(parsed.parts.serial).toBe("0123");
      expect(parsed.parts.checkdigit).toBe("4");
      expect(parsed.parts.letter).toBeNull();
    });

    it("should detect female gender when days > 500", () => {
      const parsed = NIC.parse("200051501234"); // 515 → day 15, female

      expect(parsed.gender).toBe(Gender.FEMALE);
      expect(parsed.birthday).toEqual({ year: 2000, month: 1, day: 15 });
    });
  });

  describe("old format", () => {
    it("should parse a known old-format NIC", () => {
      const parsed = NIC.parse("901404567V");

      expect(parsed.type).toBe(NICType.OLD);
      expect(parsed.value).toBe("901404567V");
      expect(parsed.gender).toBe(Gender.MALE);
      expect(parsed.birthday).toEqual({ year: 1990, month: 5, day: 20 });
      expect(parsed.parts.year).toBe("1990");
      expect(parsed.parts.days).toBe("140");
      expect(parsed.parts.serial).toBe("456");
      expect(parsed.parts.checkdigit).toBe("7");
      expect(parsed.parts.letter).toBe("V");
    });

    it("should parse an old-format NIC with X letter", () => {
      const parsed = NIC.parse("850691005X");

      expect(parsed.type).toBe(NICType.OLD);
      expect(parsed.parts.letter).toBe("X");
    });
  });
});

// ─── NIC.validate() ─────────────────────────────────────────────────────────────

describe("NIC.validate()", () => {
  it("should not return anything on success (void)", () => {
    const result = NIC.validate("901404567V");
    expect(result).toBeUndefined();
  });

  it("should throw NICError for completely invalid input", () => {
    expect(() => NIC.validate("not-a-nic")).toThrow(NICError);
    expect(() => NIC.validate("")).toThrow(NICError);
    expect(() => NIC.validate("12345")).toThrow(NICError);
  });

  it("should throw NICError for structurally valid but logically invalid NICs", () => {
    // Day 000 is invalid (days must be >= 1)
    expect(() => NIC.validate("200000001230")).toThrow(NICError);
  });

  it("should respect custom minimumAge config", () => {
    // Build a NIC for age ~20, then validate with minimumAge: 30
    const nic = NIC.builder
      .new()
      .gender(Gender.MALE)
      .birthday({ year: daylk.now.year - 20, month: 1, day: 1 })
      .serial("0000")
      .checkdigit("0")
      .build();

    expect(() => NIC.validate(nic, { minimumAge: 30 })).toThrow(NICError);
    expect(() => NIC.validate(nic, { minimumAge: 15 })).not.toThrow();
  });

  it("should respect custom check callback", () => {
    const nic = NIC.builder
      .new()
      .gender(Gender.MALE)
      .birthday({ year: 2005, month: 6, day: 1 })
      .serial("0000")
      .checkdigit("0")
      .build();

    // Custom check: reject Male NICs
    expect(() =>
      NIC.validate(nic, {
        check(parsed, Err) {
          if (parsed.gender === Gender.MALE) {
            throw new Err("Males not allowed in this check");
          }
        },
      }),
    ).toThrow(NICError);
  });
});

// ─── NIC.valid() ────────────────────────────────────────────────────────────────

describe("NIC.valid()", () => {
  it("should return true for valid NICs", () => {
    const nic = NIC.builder.new().build();
    expect(NIC.valid(nic)).toBe(true);
  });

  it("should return false for invalid NICs without throwing", () => {
    expect(NIC.valid("garbage")).toBe(false);
    expect(NIC.valid("")).toBe(false);
    expect(NIC.valid("123")).toBe(false);
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

// ─── NIC.safeParse() ────────────────────────────────────────────────────────────

describe("NIC.safeParse()", () => {
  it("should return { success: true, data } for valid NICs", () => {
    const result = NIC.safeParse("901404567V");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.value).toBe("901404567V");
      expect(result.data.type).toBe(NICType.OLD);
      expect(result.data.gender).toBe(Gender.MALE);
      expect(result.data.birthday).toEqual({ year: 1990, month: 5, day: 20 });
    }
  });

  it("should return { success: false, error } for invalid NICs", () => {
    const result = NIC.safeParse("invalid");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error).toBeInstanceOf(NICError);
    }
  });

  it("should never throw, even for completely garbage input", () => {
    expect(() => NIC.safeParse("")).not.toThrow();
    expect(() => NIC.safeParse("abc")).not.toThrow();
    expect(() => NIC.safeParse("12345")).not.toThrow();
  });

  it("should forward options to parse", () => {
    const nic = NIC.builder
      .new()
      .gender(Gender.MALE)
      .birthday({ year: daylk.now.year - 20, month: 1, day: 1 })
      .serial("0000")
      .checkdigit("0")
      .build();

    const strict = NIC.safeParse(nic, { minimumAge: 30 });
    expect(strict.success).toBe(false);

    const relaxed = NIC.safeParse(nic, { minimumAge: 15 });
    expect(relaxed.success).toBe(true);
  });

  it("should wrap custom check errors in the failure result", () => {
    const result = NIC.safeParse("901404567V", {
      check(parsed, Err) {
        if (parsed.gender === Gender.MALE) {
          throw new Err("Males not allowed");
        }
      },
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe("Males not allowed");
    }
  });

  it("should auto-sanitize input just like parse", () => {
    const result = NIC.safeParse("  901404567v  ");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.value).toBe("901404567V");
    }
  });

  it("should work with both old and new format NICs", () => {
    const oldResult = NIC.safeParse("901404567V");
    const newResult = NIC.safeParse("200001501234");

    expect(oldResult.success).toBe(true);
    expect(newResult.success).toBe(true);

    if (oldResult.success) expect(oldResult.data.type).toBe(NICType.OLD);
    if (newResult.success) expect(newResult.data.type).toBe(NICType.NEW);
  });
});

// ─── NIC.sanitize() ─────────────────────────────────────────────────────────────

describe("NIC.sanitize()", () => {
  it("should trim whitespace", () => {
    expect(NIC.sanitize("  901404567V  ")).toBe("901404567V");
  });

  it("should convert to uppercase", () => {
    expect(NIC.sanitize("901404567v")).toBe("901404567V");
    expect(NIC.sanitize("901404567x")).toBe("901404567X");
  });

  it("should handle already clean input", () => {
    expect(NIC.sanitize("901404567V")).toBe("901404567V");
  });
});

// ─── NIC.getType() ──────────────────────────────────────────────────────────────

describe("NIC.getType()", () => {
  it("should identify 12-digit NICs as NEW", () => {
    expect(NIC.getType("200001501234")).toBe(NICType.NEW);
  });

  it("should identify 9-digit + V/X NICs as OLD", () => {
    expect(NIC.getType("901404567V")).toBe(NICType.OLD);
    expect(NIC.getType("901404567X")).toBe(NICType.OLD);
  });

  it("should accept lowercase v/x and still detect OLD", () => {
    expect(NIC.getType("901404567v")).toBe(NICType.OLD);
    expect(NIC.getType("901404567x")).toBe(NICType.OLD);
  });

  it("should throw NICError for unrecognized formats", () => {
    expect(() => NIC.getType("hello")).toThrow(NICError);
    expect(() => NIC.getType("12345678A")).toThrow(NICError); // letter is not V/X
  });
});

// ─── NIC.defaultConfig ──────────────────────────────────────────────────────────

describe("NIC.defaultConfig", () => {
  it("should expose defaultConfig for both new and old NICs", () => {
    expect(NIC.defaultConfig).toBeDefined();
    expect(NIC.defaultConfig.new).toBeDefined();
    expect(NIC.defaultConfig.old).toBeDefined();
    expect(NIC.defaultConfig.new.minimumAge).toBe(MINIMUM_LEGAL_AGE_TO_HAVE_NIC);
  });
});

// ─── NIC.builder ────────────────────────────────────────────────────────────────

describe("NIC.builder", () => {
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

// ─── convert() ──────────────────────────────────────────────────────────────────

describe("convert()", () => {
  describe("Old → New", () => {
    it("should convert an old NIC to new format", () => {
      const parsed = NIC.parse("901404567V");
      const converted = parsed.convert();

      expect(converted).toBe("199014004567");
      expect(NIC.getType(converted)).toBe(NICType.NEW);
      expect(NIC.valid(converted)).toBe(true);

      // The converted NIC should represent the same person.
      const reparsed = NIC.parse(converted);
      expect(reparsed.birthday).toEqual(parsed.birthday);
      expect(reparsed.gender).toBe(parsed.gender);
    });
  });

  describe("New → Old", () => {
    it("should convert a 19XX new NIC to old format with default 'V'", () => {
      const parsed = NIC.parse("199014004567");
      const converted = parsed.convert();

      expect(converted).toBe("901404567V");
      expect(NIC.getType(converted)).toBe(NICType.OLD);
      expect(NIC.valid(converted)).toBe(true);
    });

    it("should respect the letter option when converting to old format", () => {
      const parsed = NIC.parse("199014004567");
      const converted = parsed.convert({ letter: "X" });

      expect(converted).toMatch(/X$/);
    });

    it("should throw NICError when the year is not 19XX", () => {
      const parsed = NIC.parse("200001501234");
      expect(() => parsed.convert()).toThrow(NICError);
    });

    it("should throw NICError when serial number is too large for old format", () => {
      // serial = "1234" → starts with "1", not "0", so cannot fit into 3-digit old serial
      const nic = NIC.builder
        .new()
        .gender(Gender.MALE)
        .birthday({ year: 1990, month: 5, day: 20 })
        .serial("0234") // builder prepends nothing — the NIC template adds the leading 0
        .checkdigit("0")
        .build();

      // The build process creates: yearStr=1990, days=140, nic=`1990140 0 234 0`
      // So serial in new format = "0234" which starts with "0" — this should work.
      // Let's explicitly test a case where it fails:
      // We need to parse a NIC where the serial part doesn't start with 0.
      // Let's construct one manually.
      const manualNIC = "199014012340"; // serial = "1234" → starts with "1"
      const parsed = NIC.parse(manualNIC);
      expect(() => parsed.convert()).toThrow(NICError);
    });
  });
});

// ─── Round-trip integrity ───────────────────────────────────────────────────────

describe("Round-trip integrity", () => {
  it("should survive a build → parse → convert → parse cycle (Old NIC)", () => {
    const original = NIC.builder
      .old()
      .gender(Gender.FEMALE)
      .birthday({ year: 1995, month: 8, day: 25 })
      .serial("100")
      .checkdigit("5")
      .voter(true)
      .build();

    const parsed = NIC.parse(original);
    const converted = parsed.convert(); // Old → New
    const reparsed = NIC.parse(converted);

    expect(reparsed.birthday).toEqual(parsed.birthday);
    expect(reparsed.gender).toBe(parsed.gender);
    expect(reparsed.type).toBe(NICType.NEW);
  });

  it("should survive a build → parse → convert → parse cycle (New NIC 19XX)", () => {
    const original = NIC.builder
      .new()
      .gender(Gender.MALE)
      .birthday({ year: 1998, month: 11, day: 3 })
      .serial("0050")
      .checkdigit("2")
      .build();

    const parsed = NIC.parse(original);
    const converted = parsed.convert(); // New → Old
    const reparsed = NIC.parse(converted);

    expect(reparsed.birthday).toEqual(parsed.birthday);
    expect(reparsed.gender).toBe(parsed.gender);
    expect(reparsed.type).toBe(NICType.OLD);
  });

  it("should produce valid NICs from the builder 100 times in a row", () => {
    for (let i = 0; i < 100; i++) {
      const nic = NIC.random();
      const parsed = NIC.parse(nic);

      // Every random NIC should have sane properties.
      expect(parsed.age).toBeGreaterThanOrEqual(MINIMUM_LEGAL_AGE_TO_HAVE_NIC);
      expect([Gender.MALE, Gender.FEMALE]).toContain(parsed.gender);
      expect([NICType.OLD, NICType.NEW]).toContain(parsed.type);
      expect(parsed.birthday.month).toBeGreaterThanOrEqual(1);
      expect(parsed.birthday.month).toBeLessThanOrEqual(12);
      expect(parsed.birthday.day).toBeGreaterThanOrEqual(1);
      expect(parsed.birthday.day).toBeLessThanOrEqual(31);
    }
  });
});
