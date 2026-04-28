import { daylk, Gender, NICError } from "../common";
import { NICValidator } from "../core/nic.validator";
import { OldNIC } from "../core/old-nic";
import { NICConfig, NICLetter } from "../core/nic.types";
import { OldNICState } from "./builder.types";
import { between, rand } from "./builder.utils";
import { BaseNICBuilder } from "./base-nic.builder";

export class OldNICBuilder extends BaseNICBuilder<OldNICState> {
  protected state: OldNICState;

  constructor(config: NICConfig = {}) {
    super(config);
    this.state = this.random();
  }

  /**
   * Sets the 3-digit serial number.
   * @param serial - A 3-digit string (e.g., "001", "999").
   * @example builder.serial("123")
   */
  serial(serial: string) {
    const SERIAL_REGXP = /^\d{3}$/;

    if (!SERIAL_REGXP.test(serial)) {
      throw new NICError("Invalid serial number");
    }

    this.state.serial = serial;
    return this;
  }

  /**
   * Sets the trailing letter of the old NIC. Case-insensitive.
   * @param letter - A {@link NICLetter} (`"V"`, `"X"`, `"v"`, or `"x"`).
   * @example builder.letter("V")
   */
  letter(letter: NICLetter) {
    const LETTER_REGXP = /^[vVxX]$/;

    if (!LETTER_REGXP.test(letter)) {
      throw new NICError("Invalid letter");
    }

    this.state.letter = letter.toUpperCase() as NICLetter;
    return this;
  }

  /**
   * Pass `true` for 'V' (voter), `false` for 'X' (non-voter).
   * */
  voter(voter: boolean) {
    this.state.letter = voter ? "V" : "X";
    return this;
  }

  protected random(): OldNICState {
    const year = between(1900, 1999);

    const days = between(1, daylk.totalDaysInYear(year));

    const serial = between(0, 999).toString().padStart(3, "0");

    const checkdigit = between(0, 9).toString();

    const gender = rand() < 0.5 ? Gender.MALE : Gender.FEMALE;

    const letter = rand() < 0.5 ? "V" : "X";

    return { year, days, serial, checkdigit, gender, letter };
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
