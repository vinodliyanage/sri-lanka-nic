import { Gender, NICType, NICError } from "../common";
import { NewNICBuilder } from "../builder/new-nic.builder";
import { OldNICBuilder } from "../builder/old-nic.builder";

/**
 * The main object for parsing, validating, and generating Sri Lankan NICs.
 */
export interface NICAPI {
  /**
   * Takes a NIC string and gives back an object with the parsed details like age, birthday and gender.
   * @throws {NICError} If the NIC string is invalid or fails validation constraints.
   */
  parse(nic: string, options?: NICOptions): PublicNIC;

  /**
   * Checks if a NIC is valid. Throws an error if it's not.
   */
  validate(nic: string, options?: NICOptions): void;

  /**
   * Checks if a NIC is valid. Returns true or false without throwing errors.
   */
  valid(nic: string, options?: NICOptions): boolean;

  /**
   * Removes spaces and converts the NIC to uppercase.
   */
  sanitize(nic: string): string;

  /**
   * Finds out if the NIC format is NEW (12 digits) or OLD (9 digits + letter).
   */
  getType(nic: string): NICType;

  /**
   * Returns default validation boundaries for NEW and OLD NICs.
   */
  get defaultConfig(): {
    new: ResolvedNICConfig;
    old: ResolvedNICConfig;
  };

  /**
   * Creates builders that let you step-by-step generate a NIC string.
   */
  get builder(): {
    new: (options?: NICOptions) => NewNICBuilder;
    old: (options?: NICOptions) => OldNICBuilder;
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
   * The resolved validation boundaries used for this NIC, after merging
   * any user-provided overrides with the format-specific defaults.
   *
   * Contains the age and birth-year limits that were applied during parsing.
   *
   * @example
   * const nic = NIC.parse("200012345678");
   * console.log(nic.config);
   * // {
   * //   minimumAge: 16,
   * //   maximumAge: 126,
   * //   minimumBirthYear: 1900,
   * //   maximumBirthYear: 2010,
   * // }
   *
   * // With custom overrides:
   * const nic = NIC.parse("200012345678", { minimumAge: 18 });
   * console.log(nic.config.minimumAge); // 18
   */
  config: ResolvedNICConfig;

  /**
   * Switches the NIC to the other format (e.g., Old to New).
   */
  convert(options?: { letter?: "V" | "X" }): string;
}

export type NICInstance = PublicNIC;

/**
 * Internal NIC representation used within the library.
 * Extends {@link PublicNIC} with processed parts that are not exposed to consumers.
 */
export interface InternalNIC extends PublicNIC {
  formatted: FormattedNICParts;
}

/**
 * The fully resolved validation boundaries after merging user-provided
 * overrides with format-specific defaults. All fields are readonly
 * to prevent mutation after resolution.
 */
export interface ResolvedNICConfig {
  /** The minimum age (in years) a person must be to hold a valid NIC. */
  readonly minimumAge: number;
  /** The maximum age (in years) a NIC holder can be. */
  readonly maximumAge: number;
  /** The earliest birth year considered valid. */
  readonly minimumBirthYear: number;
  /** The latest birth year considered valid. */
  readonly maximumBirthYear: number;
}

export type NICLetter = "V" | "X" | "v" | "x";

/**
 * Optional overrides for the default validation boundaries.
 * Any field left unset falls back to the format-specific default.
 */
export interface NICConfig {
  /**
   * Override the minimum age constraint.
   */
  minimumAge?: number;

  /**
   * Override the maximum age constraint.
   */
  maximumAge?: number;

  /**
   * Override the earliest valid birth year.
   */
  minimumBirthYear?: number;

  /**
   * Override the latest valid birth year.
   */
  maximumBirthYear?: number;
}

/**
 * Options for extending validation with custom logic.
 */
export interface NICValidatorConfig {
  /**
   * Only allow New NICs.
   */
  onlyNew?: boolean;

  /**
   * Only allow Old NICs.
   */
  onlyOld?: boolean;

  /**
   * A custom validation function that runs after the built-in checks.
   * Throw a {@link NICError} to reject the NIC.
   *
   * @param nic - The parsed NIC instance.
   * @param Error - The {@link NICError} constructor for throwing validation errors.
   *
   * @example
   * NIC.parse("200012345678", {
   *   check(nic, Error) {
   *     if (nic.age < 18) throw new Error("Must be 18 or older");
   *   },
   * });
   */
  check?: (nic: NICInstance, Error: typeof NICError) => void;
}

/**
 * Combined options for parsing and validating a NIC.
 *
 * This type merges validation boundary overrides ({@link NICConfig}) with
 * custom validator hooks and format restrictions ({@link NICValidatorConfig}).
 *
 * Use this to apply custom business logic (`check()`), restrict allowed formats
 * (`onlyNew`/`onlyOld`), or override default age and year boundaries.
 */
export type NICOptions = NICValidatorConfig & NICConfig;
