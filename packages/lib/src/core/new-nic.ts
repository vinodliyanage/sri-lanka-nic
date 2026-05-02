import { daylk, errors, MINIMUM_LEGAL_AGE_TO_HAVE_NIC, NICError, NICType } from "../common";
import { resolveNICConfig } from "../common/utils";
import { BaseNIC } from "./base-nic";
import { NICConfig, RawNICParts, ResolvedNICConfig } from "./nic.types";

export class NewNIC extends BaseNIC {
  public readonly type: NICType = NICType.NEW;

  public readonly value: string;
  public readonly config: ResolvedNICConfig;
  public readonly parts: RawNICParts;

  constructor(value: string, options?: NICConfig) {
    super();

    this.value = value;
    this.config = resolveNICConfig(NewNIC.defaultConfig, options);

    this.parts = {
      year: value.substring(0, 4),
      days: value.substring(4, 7),
      serial: value.substring(7, 11),
      checkdigit: value.substring(11, 12),
      letter: null,
    };
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
