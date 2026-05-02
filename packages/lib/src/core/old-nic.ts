import { daylk, MINIMUM_LEGAL_AGE_TO_HAVE_NIC, NICType } from "../common";
import { resolveNICConfig } from "../common/utils";
import { BaseNIC } from "./base-nic";
import { NICConfig, RawNICParts, ResolvedNICConfig } from "./nic.types";

export class OldNIC extends BaseNIC {
  public readonly type: NICType = NICType.OLD;

  public readonly value: string;
  public readonly config: ResolvedNICConfig;
  public readonly parts: RawNICParts;

  constructor(value: string, options?: NICConfig) {
    super();

    this.value = value;

    this.config = resolveNICConfig(OldNIC.defaultConfig, options);

    this.parts = {
      year: `19${value.substring(0, 2)}`,
      days: value.substring(2, 5),
      serial: value.substring(5, 8),
      checkdigit: value.substring(8, 9),
      letter: value.substring(9, 10),
    };
  }

  static get defaultConfig(): ResolvedNICConfig {
    const now = daylk.now;

    return {
      minimumAge: MINIMUM_LEGAL_AGE_TO_HAVE_NIC,
      maximumAge: now.year - 1900,
      minimumBirthYear: 1900,
      maximumBirthYear: 1999,
    };
  }

  convert(): string {
    const { year, days, serial, checkdigit } = this.parts;

    return `${year}${days}0${serial}${checkdigit}`;
  }
}
