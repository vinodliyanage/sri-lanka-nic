import { describe, it, expect } from "vitest";
import { NIC } from "../core/facade";
import { daylk, Gender, NICType, NICError } from "../common";
import { OldNICBuilder } from "./old";

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

      const year = parsed.birthday.year;
      expect([daylk.now.year - age, daylk.now.year - age - 1]).toContain(year);
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
