import { daylk, MINIMUM_LEGAL_AGE_TO_HAVE_NIC, NICType } from "../common";
import { BaseNIC } from "./base-nic";
import { NICConfig, RawNICParts, ResolvedNICConfig } from "./nic.types";

export class OldNIC extends BaseNIC {
  public type: NICType = NICType.OLD;

  private _parts: RawNICParts | null = null;

  constructor(
    public value: string,
    protected options?: NICConfig,
  ) {
    super();
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

  get config(): ResolvedNICConfig {
    return this.resolveConfig(OldNIC.defaultConfig);
  }

  get parts(): RawNICParts {
    if (this._parts) return this._parts;

    this._parts = {
      year: `19${this.value.substring(0, 2)}`,
      days: this.value.substring(2, 5),
      serial: this.value.substring(5, 8),
      checkdigit: this.value.substring(8, 9),
      letter: this.value.substring(9, 10),
    };

    return this._parts;
  }

  convert(): string {
    const { year, days, serial, checkdigit } = this.parts;

    return `${year}${days}0${serial}${checkdigit}`;
  }
}
