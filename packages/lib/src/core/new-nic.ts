import { daylk, errors, MINIMUM_LEGAL_AGE_TO_HAVE_NIC, NICError, NICType } from "../common";
import { resolveNICConfig } from "../common/utils";
import { BaseNIC } from "./base-nic";
import { NICConfig, RawNICParts, ResolvedNICConfig } from "./nic.types";

export class NewNIC extends BaseNIC {
  public value: string;
  public type: NICType = NICType.NEW;

  private _options: ResolvedNICConfig;
  private _parts: RawNICParts | null = null;

  constructor(value: string, options?: NICConfig) {
    super();

    this.value = value;
    this._options = resolveNICConfig(NewNIC.defaultConfig, options);
  }

  static get defaultConfig(): ResolvedNICConfig {
    const now = daylk.now;

    return {
      minimumAge: MINIMUM_LEGAL_AGE_TO_HAVE_NIC,
      maximumAge: now.year - 1900,
      minimumBirthYear: 1900,
      maximumBirthYear: now.year - MINIMUM_LEGAL_AGE_TO_HAVE_NIC,
    };
  }

  get config(): ResolvedNICConfig {
    return this._options;
  }

  get parts(): RawNICParts {
    if (this._parts) return this._parts;

    this._parts = {
      year: this.value.substring(0, 4),
      days: this.value.substring(4, 7),
      serial: this.value.substring(7, 11),
      checkdigit: this.value.substring(11, 12),
      letter: null,
    };

    return this._parts;
  }

  convert(options: { letter?: "V" | "X" } = {}) {
    const letter = options.letter ?? "V";

    let { year, days, serial, checkdigit } = this.parts;

    if (!year.startsWith("19")) {
      throw new NICError(errors.INVALID_YEAR_FOR_OLD_FORMAT_CONVERSION);
    }

    if (!serial.startsWith("0")) {
      throw new NICError(errors.SERIAL_NUMBER_TOO_LARGE_FOR_OLD_FORMAT);
    }

    return `${year.slice(2)}${days}${serial.slice(1)}${checkdigit}${letter}`;
  }
}
