import { describe, it, expect } from "vitest";
import { NIC } from "../core/facade";
import { daylk, Gender, NICType, NICError } from "../common";
import { NewNICBuilder } from "./new";

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
        .birthday({ year: 2001, month: 12, day: 31 }) // NIC system always uses 366 days → day 366
        .serial("0000")
        .checkdigit("0")
        .build();

      expect(nic).toBe("200136600000");

      const parsed = NIC.parse(nic);
      expect(parsed.birthday).toEqual({ year: 2001, month: 12, day: 31 });
    });
  });

  describe(".age() method", () => {
    it("should derive the birth year from age", () => {
      const age = 20;
      const nic = NIC.builder.new().age(age).build();
      const parsed = NIC.parse(nic);

      const year = parsed.birthday.year;
      expect([daylk.now.year - age, daylk.now.year - age - 1]).toContain(year);
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
