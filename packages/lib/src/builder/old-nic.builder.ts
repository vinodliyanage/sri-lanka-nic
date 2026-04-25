import { daylk, Gender, Birthday } from "../common";
import { NICValidator } from "../core/nic.validator";
import { OldNIC } from "../core/old-nic";
import { NICConfig, NICLetter } from "../core/nic.types";
import { OldNICBuilderContract, OldNICState } from "./builder.types";
import { between, rand } from "./builder.utils";

export class OldNICBuilder implements OldNICBuilderContract {
  private state: OldNICState = OldNICBuilder.random();

  constructor(private config: NICConfig = {}) {}

  private static random(): OldNICState {
    const year = between(1900, 1999);

    const days = between(1, daylk.totalDaysInYear(year));

    const serial = between(0, 999).toString().padStart(3, "0");

    const checkdigit = between(0, 9).toString();

    const gender = rand() < 0.5 ? Gender.MALE : Gender.FEMALE;

    const letter = rand() < 0.5 ? "V" : "X";

    return { year, days, serial, checkdigit, gender, letter };
  }

  serial(serial: string) {
    this.state.serial = serial;
    return this;
  }

  checkdigit(checkdigit: string) {
    this.state.checkdigit = checkdigit;
    return this;
  }

  gender(gender: Gender) {
    this.state.gender = gender;
    return this;
  }

  birthday(birthday: Birthday) {
    const { year, month, day } = birthday;

    const days = daylk.dayOfYear(year, month, day);

    this.state.year = year;
    this.state.days = days;

    return this;
  }

  age(age: number) {
    const year = daylk.now.year - age;
    this.state.days = between(1, daylk.totalDaysInYear(year));
    this.state.year = year;
    return this;
  }

  letter(letter: NICLetter) {
    this.state.letter = letter.toUpperCase() as NICLetter;
    return this;
  }

  voter(voter: boolean) {
    this.state.letter = voter ? "V" : "X";
    return this;
  }

  build() {
    const { year, serial, checkdigit, gender, letter } = this.state;

    let days = this.state.days;
    if (gender === Gender.FEMALE) days += 500;

    const yearStr = year.toString().slice(2);
    const daysStr = days.toString().padStart(3, "0");

    const nic = `${yearStr}${daysStr}${serial}${checkdigit}${letter}`;

    NICValidator.validate(new OldNIC(nic), this.config);

    return nic;
  }
}
