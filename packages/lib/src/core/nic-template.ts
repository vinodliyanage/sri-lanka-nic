import { Birthday, daylk, Gender, NICType } from "../common";
import { FormattedNICParts, RawNICParts, InternalNIC, ResolvedNICConfig } from "./nic.types";

export abstract class NICTemplate implements InternalNIC {
  public abstract value: string;
  public abstract type: NICType;

  public abstract get parts(): RawNICParts;
  public abstract get config(): ResolvedNICConfig;
  public abstract convert(): string;

  private _formatted: FormattedNICParts | null = null;

  // internal
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

    let totals = [31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];
    if (daylk.isLeap(year)) totals = totals.map((count, index) => (index > 0 ? count + 1 : count));

    let prev = 0;
    let month = 1;
    let day = 0;

    for (let i = 0; i < totals.length; i++) {
      const curr = totals[i];
      if (days > curr) {
        month++;
        prev = curr;
      } else {
        day = days - prev;
        break;
      }
    }

    return { year, month, day };
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
