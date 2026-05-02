import { NICError, NICType } from "../common";
import { NewNIC } from "./new-nic";
import { OldNIC } from "./old-nic";
import { NICValidator } from "./nic.validator";
import { NICConfig, InternalNIC, PublicNIC as NICInstance, NICAPI, NICOptions } from "./nic.types";
import { NewNICBuilder, OldNICBuilder } from "../builder";

export const NIC: NICAPI = {
  parse(nic: string, options?: NICOptions) {
    nic = NICValidator.sanitize(nic);

    const type = NICValidator.getType(nic);

    let instance: InternalNIC;

    if (type === NICType.NEW) instance = new NewNIC(nic, options);
    else instance = new OldNIC(nic, options);

    NICValidator.validate(instance, options);

    return instance as NICInstance;
  },

  validate(nic: string, options?: NICOptions) {
    this.parse(nic, options);
  },

  valid(nic: string, options?: NICOptions) {
    try {
      this.parse(nic, options);
      return true;
    } catch (error) {
      if (error instanceof NICError) return false;
      throw error;
    }
  },

  sanitize(nic: string) {
    return NICValidator.sanitize(nic);
  },

  getType(nic: string) {
    return NICValidator.getType(nic);
  },

  get defaultConfig() {
    return {
      new: NewNIC.defaultConfig,
      old: OldNIC.defaultConfig,
    };
  },

  get builder() {
    return {
      new: (options?: NICConfig) => new NewNICBuilder(options),
      old: (options?: NICConfig) => new OldNICBuilder(options),
    };
  },

  random() {
    const builder = Math.random() < 0.5 ? this.builder.new() : this.builder.old();
    return builder.build();
  },
};
