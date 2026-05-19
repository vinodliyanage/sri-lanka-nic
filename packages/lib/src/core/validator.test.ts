import { describe, it, expect } from "vitest";
import { NICValidator } from "./validator";
import { NewNIC } from "./new";
import { OldNIC } from "./old";
import { NICType, NICError, errors, daylk, Gender } from "../common";

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

    it("should throw INVALID_DAY_OF_YEAR for day > 366", () => {
      // Max day is always 366 regardless of year.
      const nic = new NewNIC("200036700000");
      expect(() => NICValidator.validate(nic)).toThrow(errors.INVALID_DAY_OF_YEAR);
    });

    it("should accept day 366 in any year (NIC system always uses 366 days)", () => {
      // Day 366 is valid for both leap and non-leap years.
      const nicLeap = new NewNIC("200036600000");
      const nicNonLeap = new NewNIC("200136600000");
      expect(() => NICValidator.validate(nicLeap)).not.toThrow();
      expect(() => NICValidator.validate(nicNonLeap)).not.toThrow();
    });

    it("should accept day 365 in any year", () => {
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

    describe("type restrictions", () => {
      it("should throw RESTRICTED_NIC_TYPE when onlyNew is true but type is OLD", () => {
        const nic = new OldNIC("901404567V");
        expect(() => NICValidator.validate(nic, { onlyNew: true })).toThrow(
          errors.RESTRICTED_NIC_TYPE,
        );
      });

      it("should pass when onlyNew is true and type is NEW", () => {
        const nic = new NewNIC("200001501234");
        expect(() => NICValidator.validate(nic, { onlyNew: true })).not.toThrow();
      });

      it("should throw RESTRICTED_NIC_TYPE when onlyOld is true but type is NEW", () => {
        const nic = new NewNIC("200001501234");
        expect(() => NICValidator.validate(nic, { onlyOld: true })).toThrow(
          errors.RESTRICTED_NIC_TYPE,
        );
      });

      it("should pass when onlyOld is true and type is OLD", () => {
        const nic = new OldNIC("901404567V");
        expect(() => NICValidator.validate(nic, { onlyOld: true })).not.toThrow();
      });
    });
  });
});
