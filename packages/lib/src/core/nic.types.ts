import { Gender, NICType, NICError } from "../common";
import { NICBuilder, OldNICBuilderContract } from "../builder/builder.types";

/**
 * The main object for parsing, validating, and generating Sri Lankan NICs.
 */
export interface NICAPI {
  /**
   * Takes a NIC string and gives back an object with the parsed details like age, birthday and gender.
   * @throws {NICError} If the NIC string is invalid or fails config checks.
   */
  parse(nic: string, options?: NICConfig): PublicNIC;

  /**
   * Checks if a NIC is valid. Throws an error if it's not.
   */
  validate(nic: string, options?: NICConfig): void;

  /**
   * Checks if a NIC is valid. Returns true or false without throwing errors.
   */
  valid(nic: string, options?: NICConfig): boolean;

  /**
   * Removes spaces and converts the NIC to uppercase.
   */
  sanitize(nic: string): string;

  /**
   * Finds out if the NIC format is NEW (12 digits) or OLD (9 digits + letter).
   */
  getType(nic: string): NICType;

  /**
   * Creates builders that let you step-by-step generate a NIC string.
   */
  get builder(): {
    new: (config?: NICConfig) => NICBuilder;
    old: (config?: NICConfig) => OldNICBuilderContract;
  };

  /**
   * Generates a random, mathematically valid NIC string. Useful for testing.
   */
  random(): string;
}

/**
 * The raw string slices taken directly from the NIC before any processing.
 */
export interface RawNICParts {
  /**
   * The birth year as a 4-char string.
   * - New NIC: taken directly from the first 4 digits.
   * - Old NIC: '19' is prepended to the 2-digit slice (e.g., '95' → '1995').
   */
  year: string;

  /**
   * The day-of-year string slice.
   * - Male: 1–366 (the actual day of the year).
   * - Female: 501–866 (day of the year + 500).
   */
  days: string;

  /**
   * The exact string slice representing the serial number.
   */
  serial: string;

  /**
   * The exact string slice for the check digit.
   */
  checkdigit: string;

  /**
   * The exact string slice for the trailing letter, if present.
   */
  letter: string | null;
}

/**
 * The processed and type-cast parts of the NIC.
 */
export interface FormattedNICParts {
  year: number;
  days: number;
  gender: Gender;
  serial: string;
  checkdigit: string;
  letter: string | null;
}

/**
 * The main NIC object you get back after parsing.
 */
export interface PublicNIC {
  /**
   * The original NIC string.
   */
  value: string;

  /**
   * The type of the NIC format (Old or New).
   */
  type: NICType;

  /**
   * The gender extracted from the NIC.
   */
  gender: Gender;

  /**
   * The parsed date of birth.
   */
  birthday: { year: number; month: number; day: number };

  /**
   * The age calculated from the date of birth.
   */
  age: number;

  /**
   * The raw parts of the NIC.
   */
  parts: RawNICParts;

  /**
   * Switches the NIC to the other format (e.g., Old to New).
   */
  convert(options?: { letter?: "V" | "X" }): string;
}

export type NICInstance = PublicNIC;

/**
 * Internal NIC object used by the library.
 */
export interface InternalNIC extends PublicNIC {
  config: ResolvedNICConfig;
  formatted: FormattedNICParts;
}

/**
 * Config options with all defaults filled in.
 */
export interface ResolvedNICConfig {
  minimumAge: number;
  maximumAge: number;
  minimumBirthYear: number;
  maximumBirthYear: number;
}

export type NICLetter = "V" | "X" | "v" | "x";

/**
 * Options to customize how a NIC is parsed or validated.
 */
export interface NICConfig {
  minimumAge?: number;
  maximumAge?: number;
  minimumBirthYear?: number;
  maximumBirthYear?: number;

  /**
   * A custom function you can provide to write your own validation rules.
   */
  check?: (nic: NICInstance, Error: typeof NICError) => void;
}
