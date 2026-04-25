import { daylk, Gender, MINIMUM_LEGAL_AGE_TO_HAVE_NIC, Birthday } from "../common";
import { NewNIC } from "../core/new-nic";
import { NICValidator } from "../core/nic.validator";
import { NICConfig } from "../core/nic.types";
import { NICBuilder, NICState } from "./builder.types";
import { between, rand } from "./builder.utils";

export class NewNICBuilder implements NICBuilder {
  private state: NICState = NewNICBuilder.random();

  constructor(private config: NICConfig = {}) {}

  private static random(): NICState {
    const year = between(1900, daylk.now.year - MINIMUM_LEGAL_AGE_TO_HAVE_NIC - 1);

    const days = between(1, daylk.totalDaysInYear(year));

    const serial = between(0, 999).toString().padStart(3, "0");

    const checkdigit = between(0, 9).toString();

    const gender = rand() < 0.5 ? Gender.MALE : Gender.FEMALE;

    return { year, days, serial, checkdigit, gender };
  }

  serial(serial: string) {
    this.state.serial = serial;
    return this;
  }

  checkdigit(checkdigit: string) {
    this.state.checkdigit = checkdigit.toString();
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

  build() {
    const { year, serial, checkdigit, gender } = this.state;

    let days = this.state.days;
    if (gender === Gender.FEMALE) days += 500;

    const daysStr = days.toString().padStart(3, "0");
    const yearStr = year.toString();

    const nic = `${yearStr}${daysStr}0${serial}${checkdigit}`;

    NICValidator.validate(new NewNIC(nic), this.config);

    return nic;
  }
}
