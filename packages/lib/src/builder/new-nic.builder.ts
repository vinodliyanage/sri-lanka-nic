import { daylk, Gender, MINIMUM_LEGAL_AGE_TO_HAVE_NIC, NICError } from "../common";
import { NewNIC } from "../core/new-nic";
import { NICValidator } from "../core/nic.validator";
import { NICConfig } from "../core/nic.types";
import { NICState } from "./builder.types";
import { between, rand } from "./builder.utils";
import { BaseNICBuilder } from "./base-nic.builder";

export class NewNICBuilder extends BaseNICBuilder<NICState> {
  protected state: NICState;

  constructor(config: NICConfig = {}) {
    super(config);
    this.state = this.random();
  }

  /**
   * Sets the 4-digit serial number.
   * @param serial - A 4-digit string (e.g., "0001", "9999").
   * @example builder.serial("1234")
   */
  serial(serial: string) {
    const SERIAL_REGXP = /^\d{4}$/;

    if (!SERIAL_REGXP.test(serial)) {
      throw new NICError("Invalid serial number");
    }

    this.state.serial = serial;
    return this;
  }

  protected random(): NICState {
    const year = between(1900, daylk.now.year - MINIMUM_LEGAL_AGE_TO_HAVE_NIC - 1);

    const days = between(1, daylk.totalDaysInYear(year));

    const serial = between(0, 9999).toString().padStart(4, "0");

    const checkdigit = between(0, 9).toString();

    const gender = rand() < 0.5 ? Gender.MALE : Gender.FEMALE;

    return { year, days, serial, checkdigit, gender };
  }

  build() {
    const { year, serial, checkdigit, gender } = this.state;

    let days = this.state.days;
    if (gender === Gender.FEMALE) days += 500;

    const daysStr = days.toString().padStart(3, "0");
    const yearStr = year.toString();

    const nic = `${yearStr}${daysStr}${serial}${checkdigit}`;

    NICValidator.validate(new NewNIC(nic), this.config);

    return nic;
  }
}
