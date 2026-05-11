import { daylk, Gender, Birthday, NICError } from "../common";
import { NICBuildingState } from "./builder.types";
import { between, rand } from "./builder.utils";
import { ResolvedNICConfig } from "../core/nic.types";

export abstract class BaseNICBuilder {
  protected abstract state: NICBuildingState;
  protected abstract options: ResolvedNICConfig;
  protected abstract random(): NICBuildingState;

  /**
   * Generates, validates, and returns the final NIC string.
   * @returns The generated NIC string.
   * e.g "984521234V" or "200011234567"
   */
  public abstract build(): string;

  /**
   * Sets the check digit.
   * @param checkdigit - A single digit string (e.g., "5").
   * @example builder.checkdigit("5")
   */
  checkdigit(checkdigit: string) {
    const CHECKDIGIT_REGXP = /^\d$/;

    if (!CHECKDIGIT_REGXP.test(checkdigit)) {
      throw new NICError("Invalid check digit");
    }

    this.state.checkdigit = checkdigit;
    return this;
  }

  /**
   * Sets the gender.
   * @param gender - The gender (MALE or FEMALE).
   * @example builder.gender(Gender.MALE)
   */
  gender(gender: Gender) {
    this.state.gender = gender;
    return this;
  }

  /**
   * Sets the exact date of birth. Overrides any previously set age.
   * @param birthday - A {@link Birthday} object with `year`, `month`, and `day` properties.
   * @example builder.birthday({ year: 1999, month: 12, day: 12 })
   */
  birthday(birthday: Birthday) {
    const { year, month, day } = birthday;

    const days = daylk.dayOfYear(year, month, day);

    this.state.year = year;
    this.state.days = days;

    return this;
  }

  /**
   *  Sets the birth year from age. The day-of-year is randomised.
   * @param age - The age in years (e.g., 25).
   * @example builder.age(25)
   */
  age(age: number) {
    const now = daylk.now;
    const todayDayOfYear = daylk.dayOfYear(now.year, now.month, now.day);
    const totalDaysThisYear = daylk.totalDaysInYear(now.year);

    const birthdayPassed = rand() < todayDayOfYear / totalDaysThisYear;
    const year = birthdayPassed ? now.year - age : now.year - age - 1;

    if (birthdayPassed) {
      // Born this many years ago, birthday on or before today
      const maxDay = daylk.dayOfYear(year, now.month, now.day);
      this.state.days = between(1, maxDay);
    } else {
      // Born one more year ago, birthday is after today
      const minDay = daylk.dayOfYear(year, now.month, now.day) + 1;
      this.state.days = between(minDay, daylk.totalDaysInYear(year));
    }

    this.state.year = year;
    return this;
  }
}
