import { daylk } from "./daylk";
import { NICError } from "./nic-error";
import { NICConfig } from "./nic-config";
import { getNICParts, NICParts } from "./nic-parts";

export class NIC {
  public static readonly Error = NICError;
  public static readonly Config = NICConfig;

  public readonly value: string;
  public readonly type: NICType;
  public readonly gender: Gender;
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

  static sanitize(nic: string) {
    const result = NIC.validator(nic);

    if (!result.success) throw result.error;

    return result.data.nic;
  }

  static valid(nic: string) {
    const result = NIC.validate(nic);
    return result.valid;
  }

  static validate(nic: string) {
    const result = NIC.validator(nic);

    if (result.success) return { valid: true };

    return { valid: false, error: result.error };
  }

  static parse(nic: string) {
    const result = NIC.validator(nic);

    if (!result.success) throw result.error;

    const { nic: nicSanitized, type, gender, dayOfBirthYear, birthYear, parts } = result.data;

    return new NIC(nicSanitized, type, gender, dayOfBirthYear, birthYear, parts);
  }

  get birthday() {
    return NIC.getBirthday(this._birthYear, this._dayOfBirthYear);
  }

  get age() {
    return NIC.getAge(this._birthYear, this._dayOfBirthYear);
  }

  get voter() {
    if (this.type === NICType.NEW) return null;
    return this.parts.letter === "V";
  }

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

  toString() {
    return this.value;
  }

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

export enum NICType {
  OLD = "old",
  NEW = "new",
}

export enum Gender {
  MALE = "male",
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
