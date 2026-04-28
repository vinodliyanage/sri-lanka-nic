import { describe, it, expect } from "vitest";
import { NIC } from "../core/nic";
import { daylk, Gender, NICType, NICError, MINIMUM_LEGAL_AGE_TO_HAVE_NIC } from "../common";
import { NewNICBuilder } from "./new-nic.builder";
import { OldNICBuilder } from "./old-nic.builder";

describe("NewNICBuilder", () => {
  describe("random defaults", () => {
    it("should build a valid 12-digit new-format NIC with random defaults", () => {
      const nic = NIC.builder.new().build();

      expect(nic).toMatch(/^\d{12}$/);
      expect(NIC.valid(nic)).toBe(true);
      expect(NIC.getType(nic)).toBe(NICType.NEW);
    });

    it("should produce different NICs across multiple calls", () => {
      const results = new Set(Array.from({ length: 20 }, () => NIC.builder.new().build()));

      // With random serial + checkdigit + birthday, collisions are extremely unlikely.
      expect(results.size).toBeGreaterThan(1);
    });
  });

  describe("chainable setters", () => {
    it("should return `this` from every setter for fluent chaining", () => {
      const builder = new NewNICBuilder();
      const a = builder.serial("0001");
      const b = a.checkdigit("0");
      const c = b.gender(Gender.MALE);
      const d = c.birthday({ year: 2005, month: 6, day: 1 });

      // Every return value should be the same builder instance.
      expect(a).toBe(builder);
      expect(b).toBe(builder);
      expect(c).toBe(builder);
      expect(d).toBe(builder);
    });
  });

  describe("deterministic builds", () => {
    it("should encode a Male birthday correctly", () => {
      const nic = NIC.builder
        .new()
        .gender(Gender.MALE)
        .birthday({ year: 2000, month: 1, day: 15 })
        .serial("0123")
        .checkdigit("4")
        .build();

      // year=2000, days=015, serial=0123, checkdigit=4
      expect(nic).toBe("200001501234");

      const parsed = NIC.parse(nic);
      expect(parsed.gender).toBe(Gender.MALE);
      expect(parsed.birthday).toEqual({ year: 2000, month: 1, day: 15 });
    });

    it("should add 500 to the day-of-year for Females", () => {
      const nic = NIC.builder
        .new()
        .gender(Gender.FEMALE)
        .birthday({ year: 2000, month: 1, day: 15 })
        .serial("0123")
        .checkdigit("4")
        .build();

      // day 15 + 500 = 515
      expect(nic).toBe("200051501234");

      const parsed = NIC.parse(nic);
      expect(parsed.gender).toBe(Gender.FEMALE);
      expect(parsed.birthday).toEqual({ year: 2000, month: 1, day: 15 });
    });

    it("should handle a leap year birthday (Feb 29)", () => {
      const nic = NIC.builder
        .new()
        .gender(Gender.MALE)
        .birthday({ year: 2000, month: 2, day: 29 }) // 2000 is a leap year
        .serial("0001")
        .checkdigit("0")
        .build();

      // Feb 29 in a leap year → day 60
      expect(nic).toBe("200006000010");

      const parsed = NIC.parse(nic);
      expect(parsed.birthday).toEqual({ year: 2000, month: 2, day: 29 });
    });

    it("should handle last day of year (Dec 31) correctly", () => {
      const nic = NIC.builder
        .new()
        .gender(Gender.MALE)
        .birthday({ year: 2001, month: 12, day: 31 }) // non-leap → day 365
        .serial("0000")
        .checkdigit("0")
        .build();

      expect(nic).toBe("200136500000");

      const parsed = NIC.parse(nic);
      expect(parsed.birthday).toEqual({ year: 2001, month: 12, day: 31 });
    });
  });

  describe(".age() method", () => {
    it("should derive the birth year from age", () => {
      const age = 20;
      const nic = NIC.builder.new().age(age).build();
      const parsed = NIC.parse(nic);

      expect(parsed.birthday.year).toBe(daylk.now.year - age);
    });
  });

  describe("validation during build", () => {
    it("should throw NICError when config constraints are violated", () => {
      // Build a NIC for someone born in 2000, but require minimumAge=99
      expect(() =>
        NIC.builder
          .new({ minimumAge: 99 })
          .birthday({ year: 2000, month: 1, day: 1 })
          .gender(Gender.MALE)
          .serial("0000")
          .checkdigit("0")
          .build(),
      ).toThrow(NICError);
    });
  });
});

describe("OldNICBuilder", () => {
  describe("random defaults", () => {
    it("should build a valid old-format NIC (9 digits + V/X)", () => {
      const nic = NIC.builder.old().build();

      expect(nic).toMatch(/^\d{9}[VX]$/);
      expect(NIC.valid(nic)).toBe(true);
      expect(NIC.getType(nic)).toBe(NICType.OLD);
    });
  });

  describe("chainable setters", () => {
    it("should return `this` from every setter for fluent chaining", () => {
      const builder = new OldNICBuilder();
      const a = builder.serial("001");
      const b = a.checkdigit("0");
      const c = b.gender(Gender.MALE);
      const d = c.letter("V");
      const e = d.voter(true);
      const f = e.birthday({ year: 1990, month: 5, day: 20 });

      expect(a).toBe(builder);
      expect(b).toBe(builder);
      expect(c).toBe(builder);
      expect(d).toBe(builder);
      expect(e).toBe(builder);
      expect(f).toBe(builder);
    });
  });

  describe("deterministic builds", () => {
    it("should encode a Male birthday with V letter correctly", () => {
      const nic = NIC.builder
        .old()
        .gender(Gender.MALE)
        .birthday({ year: 1990, month: 5, day: 20 })
        .serial("456")
        .checkdigit("7")
        .letter("V")
        .build();

      // year=1990 → "90", May 20 in non-leap = day 140, serial=456, check=7, letter=V
      expect(nic).toBe("901404567V");

      const parsed = NIC.parse(nic);
      expect(parsed.gender).toBe(Gender.MALE);
      expect(parsed.birthday).toEqual({ year: 1990, month: 5, day: 20 });
    });

    it("should add 500 to day-of-year for Females", () => {
      const nic = NIC.builder
        .old()
        .gender(Gender.FEMALE)
        .birthday({ year: 1990, month: 1, day: 1 })
        .serial("000")
        .checkdigit("0")
        .letter("V")
        .build();

      // day 1 + 500 = 501
      expect(nic).toBe("905010000V");

      const parsed = NIC.parse(nic);
      expect(parsed.gender).toBe(Gender.FEMALE);
      expect(parsed.birthday).toEqual({ year: 1990, month: 1, day: 1 });
    });

    it("should use 'X' letter for non-voter", () => {
      const nic = NIC.builder
        .old()
        .gender(Gender.MALE)
        .birthday({ year: 1985, month: 3, day: 10 })
        .serial("100")
        .checkdigit("5")
        .letter("X")
        .build();

      expect(nic).toMatch(/X$/);
      expect(nic).toBe("850691005X");
    });
  });

  describe(".voter() shorthand", () => {
    it("should set letter to 'V' when voter(true)", () => {
      const nic = NIC.builder.old().voter(true).build();
      expect(nic).toMatch(/V$/);
    });

    it("should set letter to 'X' when voter(false)", () => {
      const nic = NIC.builder.old().voter(false).build();
      expect(nic).toMatch(/X$/);
    });
  });

  describe(".letter() case handling", () => {
    it("should accept lowercase 'v' and uppercase it", () => {
      const nic = NIC.builder
        .old()
        .letter("v" as "V")
        .build();
      expect(nic).toMatch(/V$/);
    });

    it("should accept lowercase 'x' and uppercase it", () => {
      const nic = NIC.builder
        .old()
        .letter("x" as "X")
        .build();
      expect(nic).toMatch(/X$/);
    });
  });

  describe(".age() method", () => {
    it("should derive the birth year from age", () => {
      const age = 40;
      const nic = NIC.builder.old().age(age).build();
      const parsed = NIC.parse(nic);

      expect(parsed.birthday.year).toBe(daylk.now.year - age);
    });
  });

  describe("validation during build", () => {
    it("should throw NICError when config constraints are violated", () => {
      expect(() =>
        NIC.builder
          .old({ minimumAge: 99 })
          .birthday({ year: 1990, month: 1, day: 1 })
          .gender(Gender.MALE)
          .serial("000")
          .checkdigit("0")
          .letter("V")
          .build(),
      ).toThrow(NICError);
    });
  });
});

describe("NIC.random()", () => {
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

describe("NIC.validate()", () => {
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
});

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

// Round-trip: build → parse → convert

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
