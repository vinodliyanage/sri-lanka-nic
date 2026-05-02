import { daylk, errors, NICError, NICType } from "../common";
import { InternalNIC, NICValidatorConfig } from "./nic.types";

export const NICValidator = {
  sanitize(nic: string) {
    return nic.trim().toUpperCase();
  },

  getType(nic: string) {
    const STRUCTURE_OLD = /^[0-9]{9}[vVxX]$/;
    const STRUCTURE_NEW = /^[0-9]{12}$/;

    nic = this.sanitize(nic);

    if (STRUCTURE_NEW.test(nic)) return NICType.NEW;
    if (STRUCTURE_OLD.test(nic)) return NICType.OLD;

    throw new NICError(errors.INVALID_NIC_STRUCTURE);
  },

  validate(nic: InternalNIC, options?: NICValidatorConfig) {
    const config = nic.config;

    const { year, days } = nic.formatted;

    const totalDaysInBirthYear = daylk.totalDaysInYear(year);

    if (year < config.minimumBirthYear) {
      throw new NICError(errors.MAXIMUM_AGE_REQUIREMENT_NOT_MET);
    }

    if (year > config.maximumBirthYear) {
      throw new NICError(errors.MINIMUM_AGE_REQUIREMENT_NOT_MET);
    }

    if (days < 1 || days > totalDaysInBirthYear) {
      throw new NICError(errors.INVALID_DAY_OF_YEAR);
    }

    if (nic.age < config.minimumAge) {
      throw new NICError(errors.MINIMUM_AGE_REQUIREMENT_NOT_MET);
    }

    if (nic.age > config.maximumAge) {
      throw new NICError(errors.MAXIMUM_AGE_REQUIREMENT_NOT_MET);
    }

    // optional validation checks
    const { onlyNew, onlyOld, check } = options || {};

    if (onlyNew && nic.type !== NICType.NEW) {
      throw new NICError(errors.RESTRICTED_NIC_TYPE);
    }

    if (onlyOld && nic.type !== NICType.OLD) {
      throw new NICError(errors.RESTRICTED_NIC_TYPE);
    }

    check?.(nic, NICError);
  },
};
