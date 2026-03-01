import { daylk } from "./daylk";
import { NICError } from "./nic-error";
import { NICConfig } from "./nic-config";
import { getNICParts, NICParts } from "./nic-parts";

/**
 * Represents a Sri Lankan National Identity Card (NIC).
 *
 * This class provides utilities to parse, validate, and extract information
 * from both old-format (9 digits + letter) and new-format (12 digits) NICs.
 *
 * Instances are created via the static {@link NIC.parse} method, which
 * performs full validation before returning a `NIC` object.
 */
export class NIC {
  /** Reference to the {@link NICError} class used for all NIC-related errors. */
  public static readonly Error = NICError;

  /**
   * Reference to the {@link NICConfig} class that holds configurable
   * validation constants such as minimum legal age and oldest valid birth year.
   */
  public static readonly Config = NICConfig;

  /** The sanitized (trimmed, uppercased) NIC string. */
  public readonly value: string;

  /** The format type of this NIC — either {@link NICType.OLD} or {@link NICType.NEW}. */
  public readonly type: NICType;

  /** The gender derived from this NIC — either {@link Gender.MALE} or {@link Gender.FEMALE}. */
  public readonly gender: Gender;

  /**
   * The decomposed structural parts of this NIC.
   *
   * Contains the `year`, `days`, `serial`, `checkdigit`, and `letter`
   * (letter is `null` for new-format NICs).
   */
  public readonly parts: NICParts;

  private _dayOfBirthYear: number;
  private _birthYear: number;

  private static readonly STRUCTURE_OLD = /^[0-9]{9}[vVxX]$/;
  private static readonly STRUCTURE_NEW = /^[0-9]{12}$/;

  private constructor(
    nic: string,
    type: NICType,
    gender: Gender,
    dayOfBirthYear: number,
    birthYear: number,
    parts: NICParts,
  ) {
    this.type = type;
    this.gender = gender;
    this.value = nic;
    this.parts = parts;

    this._dayOfBirthYear = dayOfBirthYear;
    this._birthYear = birthYear;
  }

  /**
   * Validates a NIC string and returns the sanitized (trimmed, uppercased) version.
   *
   * @param nic - The raw NIC string to sanitize.
   * @returns The sanitized NIC string.
   * @throws {NICError} If the NIC is invalid.
   */
  static sanitize(nic: string) {
    const result = NIC.validator(nic);

    if (!result.success) throw result.error;

    return result.data.nic;
  }

  /**
   * Checks whether a NIC string is valid.
   *
   * This is a convenience shorthand for {@link NIC.validate} that returns
   * only a boolean, discarding any error details.
   *
   * @param nic - The NIC string to check.
   * @returns `true` if the NIC is valid, `false` otherwise.
   */
  static valid(nic: string) {
    const result = NIC.validate(nic);
    return result.valid;
  }

  /**
   * Validates a NIC string and returns the result with error details.
   *
   * Unlike {@link NIC.valid}, this method provides the specific
   * {@link NICError} when validation fails, which is useful for
   * displaying user-facing error messages.
   *
   * @param nic - The NIC string to validate.
   * @returns An object with `valid: true` on success, or `valid: false`
   *          and an `error` property containing the {@link NICError} on failure.
   */
  static validate(nic: string) {
    const result = NIC.validator(nic);

    if (result.success) return { valid: true };

    return { valid: false, error: result.error };
  }

  /**
   * Parses a NIC string into a fully validated {@link NIC} instance.
   *
   * This is the primary way to create a `NIC` object. The input is
   * validated, sanitized, and decomposed into its structural parts.
   *
   * @param nic - The raw NIC string to parse.
   * @returns A new {@link NIC} instance with all extracted information.
   * @throws {NICError} If the NIC is invalid.
   */
  static parse(nic: string) {
    const result = NIC.validator(nic);

    if (!result.success) throw result.error;

    const { nic: nicSanitized, type, gender, dayOfBirthYear, birthYear, parts } = result.data;

    return new NIC(nicSanitized, type, gender, dayOfBirthYear, birthYear, parts);
  }

  /**
   * The date of birth derived from this NIC.
   *
   * @returns An object containing `year`, `month` (1–12), and `day` (1–31).
   */
  get birthday() {
    return NIC.getBirthday(this._birthYear, this._dayOfBirthYear);
  }

  /**
   * The current age of the NIC holder, calculated from the NIC's
   * encoded birth date and the current date in Sri Lanka.
   *
   * @returns The age in whole years.
   */
  get age() {
    return NIC.getAge(this._birthYear, this._dayOfBirthYear);
  }

  /**
   * Whether the NIC holder is eligible to vote, based on the trailing
   * letter of an old-format NIC (`"V"` = voter, `"X"` = non-voter).
   *
   * Returns `null` for new-format NICs, as they do not encode voter status.
   *
   * @returns `true` if the holder is a voter, `false` if not, or `null`
   *          for new-format NICs.
   */
  get voter() {
    if (this.type === NICType.NEW) return null;
    return this.parts.letter === "V";
  }

  /**
   * Converts this NIC between old and new formats.
   *
   * - **Old → New**: Expands the 2-digit year to 4 digits, pads the serial
   *   number, and drops the trailing letter.
   * - **New → Old**: Only possible for NICs with a birth year starting with
   *   `"19"` and a serial number starting with `"0"`. Throws a
   *   {@link NICError} otherwise.
   *
   * @returns The converted NIC string in the opposite format.
   * @throws {NICError} `INVALID_YEAR_FOR_OLD_FORMAT_CONVERSION` if the
   *         birth year does not start with `"19"`.
   * @throws {NICError} `SERIAL_NUMBER_TOO_LARGE_FOR_OLD_FORMAT` if the
   *         serial number cannot fit in the old format.
   */
  convert() {
    const { year, days, serial, checkdigit } = this.parts;

    if (this.type === NICType.OLD) return `${year}${days}0${serial}${checkdigit}`;

    // for new format
    if (!year.startsWith("19")) {
      throw new NIC.Error("INVALID_YEAR_FOR_OLD_FORMAT_CONVERSION", year);
    }

    if (!serial.startsWith("0")) {
      throw new NIC.Error("SERIAL_NUMBER_TOO_LARGE_FOR_OLD_FORMAT", serial);
    }

    return `${year.slice(2)}${days}${serial.slice(1)}${checkdigit}V`;
  }

  /**
   * Returns the sanitized NIC string.
   *
   * Allows `NIC` instances to be used seamlessly in string contexts
   * (e.g., template literals).
   */
  toString() {
    return this.value;
  }

  /**
   * Returns a plain object representation of this NIC, suitable for
   * JSON serialization.
   *
   * @returns An object containing `nic`, `type`, `gender`, `birthday`,
   *          `age`, `voter`, and `parts`.
   */
  toJSON() {
    return {
      nic: this.value,
      type: this.type,
      gender: this.gender,
      birthday: this.birthday,
      age: this.age,
      voter: this.voter,
      parts: this.parts,
    };
  }

  private static getBirthday(birthYear: number, dayOfBirthYear: number) {
    let totals = [31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];
    if (daylk.isLeap(birthYear)) totals = totals.map((count, index) => (index > 0 ? count + 1 : count));

    let prev = 0;
    let month = 1;
    let day = 0;

    for (let i = 0; i < totals.length; i++) {
      const curr = totals[i];
      if (dayOfBirthYear > curr) {
        month++;
        prev = curr;
      } else {
        day = dayOfBirthYear - prev;
        break;
      }
    }

    return { year: birthYear, month, day };
  }

  private static getAge(birthYear: number, dayOfBirthYear: number) {
    const now = daylk.now();

    const nyear = now.year;
    const nmonth = now.month;
    const nday = now.day;

    const birthday = this.getBirthday(birthYear, dayOfBirthYear);

    let age = nyear - birthday.year;

    const monthDiff = nmonth - birthday.month;
    const dateDiff = nday - birthday.day;

    if (monthDiff < 0 || (monthDiff === 0 && dateDiff < 0)) age--;

    return age;
  }

  private static validator(nic: string): ValidatorResult {
    nic = nic.trim().toUpperCase();

    let type: NICType;
    if (NIC.STRUCTURE_OLD.test(nic)) type = NICType.OLD;
    else if (NIC.STRUCTURE_NEW.test(nic)) type = NICType.NEW;
    else return { success: false, error: new NIC.Error("INVALID_NIC_STRUCTURE") };

    const nicParts = getNICParts(nic, type);

    const birthYear = parseInt(nicParts.year);
    let dayOfBirthYear = parseInt(nicParts.days);

    let gender: Gender;
    if (dayOfBirthYear > 500) {
      dayOfBirthYear -= 500;
      gender = Gender.FEMALE;
    } else {
      gender = Gender.MALE;
    }

    const latestBirthYearForValidNIC = daylk.now().year - NICConfig.MINIMUM_LEGAL_AGE_TO_HAVE_NIC;
    const totalDaysInBirthYear = daylk.totalDaysInYear(birthYear);

    // * Extra Validation Starts Here

    // check that the birth year is above the minimum allowed year
    if (birthYear < NIC.Config.OLDEST_BIRTH_YEAR_FOR_VALID_NIC) {
      return { success: false, error: new NIC.Error("MAXIMUM_AGE_REQUIREMENT_NOT_MET") };
    }

    // and does not exceed the maximum allowed year (which enforces the 15-year minimum age rule).
    if (birthYear > latestBirthYearForValidNIC) {
      return { success: false, error: new NIC.Error("MINIMUM_AGE_REQUIREMENT_NOT_MET") };
    }

    // The day must be at least 1 and cannot exceed the total number of days in the given birth year
    // (366 for leap years, 365 for non-leap years).
    if (dayOfBirthYear < 1 || dayOfBirthYear > totalDaysInBirthYear) {
      return { success: false, error: new NIC.Error("INVALID_DAY_OF_YEAR") };
    }

    // If the person was born in the maximum allowed year (i.e., they turn 15 this year),
    // needed to check if they have actually reached the age of 15.
    if (birthYear === latestBirthYearForValidNIC) {
      if (NIC.getAge(birthYear, dayOfBirthYear) < NIC.Config.MINIMUM_LEGAL_AGE_TO_HAVE_NIC) {
        return { success: false, error: new NIC.Error("MINIMUM_AGE_REQUIREMENT_NOT_MET") };
      }
    }

    // * Extra Validation Ends Here

    return {
      success: true,
      data: { nic, type, birthYear, dayOfBirthYear, gender, parts: nicParts },
    };
  }
}

/**
 * The format type of a Sri Lankan NIC.
 */
export enum NICType {
  /** Old format: 9 digits followed by `V` or `X` (e.g. `"932345678V"`). */
  OLD = "old",
  /** New format: 12 digits (e.g. `"200012345678"`). */
  NEW = "new",
}

/**
 * Gender of the NIC holder, derived from the day-of-year value
 * encoded in the NIC (values above 500 indicate female).
 */
export enum Gender {
  /** Male — day-of-year value is 1–366. */
  MALE = "male",
  /** Female — day-of-year value is 501–866. */
  FEMALE = "female",
}

type ValidatorResult =
  | {
      success: true;
      data: {
        nic: string;
        type: NICType;
        birthYear: number;
        dayOfBirthYear: number;
        gender: Gender;
        parts: NICParts;
      };
    }
  | { success: false; error: NICError };
