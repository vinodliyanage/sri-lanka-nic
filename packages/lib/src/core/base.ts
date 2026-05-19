import { Birthday, daylk, errors, Gender, NICError, NICType } from "../common";
import { FormattedNICParts, RawNICParts, InternalNIC, ResolvedNICConfig } from "./types";

export abstract class BaseNIC implements InternalNIC {
  public abstract readonly type: NICType;
  public abstract readonly value: string;
  public abstract readonly config: ResolvedNICConfig;
  public abstract readonly parts: RawNICParts;

  public abstract convert(): string;

  private _formatted: FormattedNICParts | null = null;

  get formatted(): FormattedNICParts {
    if (this._formatted) return this._formatted;

    const parts = this.parts;

    const year = parseInt(parts.year, 10);
    let days = parseInt(parts.days, 10);

    let gender = Gender.MALE;

    if (days > 500) {
      days -= 500;
      gender = Gender.FEMALE;
    }

    this._formatted = {
      year,
      days,
      gender,
      serial: parts.serial,
      checkdigit: parts.checkdigit,
      letter: parts.letter,
    };

    return this._formatted;
  }

  get birthday(): Birthday {
    const { year, days } = this.formatted;

    const monthDays = daylk.MONTH_DAYS;
    let remaining = days;

    for (let i = 0; i < monthDays.length; i++) {
      const count = monthDays[i];

      if (remaining <= count) {
        const month = i + 1;
        const day = remaining;

        return { year, month, day };
      }

      remaining -= count;
    }

    throw new NICError(errors.INVALID_NIC_BIRTHDAY);
  }

  get age() {
    const now = daylk.now;

    const nyear = now.year;
    const nmonth = now.month;
    const nday = now.day;

    const birthday = this.birthday;

    let age = nyear - birthday.year;

    const monthDiff = nmonth - birthday.month;
    const dateDiff = nday - birthday.day;

    if (monthDiff < 0 || (monthDiff === 0 && dateDiff < 0)) age--;

    return age;
  }

  get gender() {
    return this.formatted.gender;
  }

  toString() {
    return this.value;
  }

  toJSON() {
    return {
      value: this.value,
      parts: this.parts,
      type: this.type,
      birthday: this.birthday,
      age: this.age,
      gender: this.gender,
    };
  }
}
