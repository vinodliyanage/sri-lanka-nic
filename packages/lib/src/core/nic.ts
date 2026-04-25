import { NICError, NICType } from "../common";
import { NewNIC } from "./new-nic";
import { OldNIC } from "./old-nic";
import { NICValidator } from "./nic.validator";
import { NICConfig, InternalNIC, PublicNIC as NICInstance, NICAPI } from "./nic.types";
import { NewNICBuilder, OldNICBuilder } from "../builder";

export const NIC: NICAPI = {
  parse(nic: string, options?: NICConfig) {
    nic = NICValidator.sanitize(nic);

    const type = NICValidator.getType(nic);

    let instance: InternalNIC;

    if (type === NICType.NEW) instance = new NewNIC(nic);
    else instance = new OldNIC(nic);

    NICValidator.validate(instance, options);

    return instance as NICInstance;
  },

  validate(nic: string, options?: NICConfig) {
    this.parse(nic, options);
  },

  valid(nic: string, options?: NICConfig) {
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

  get builder() {
    return {
      new: (config?: NICConfig) => new NewNICBuilder(config),
      old: (config?: NICConfig) => new OldNICBuilder(config),
    };
  },

  random() {
    const builder = Math.random() < 0.5 ? this.builder.new() : this.builder.old();
    return builder.build();
  },
};
