import { NICConfig } from "./nic-config";

export const errors = {
  INVALID_NIC_STRUCTURE: () =>
    `Invalid NIC structure in the given NIC number. Old format requires 9 digits followed by 'V' or 'X'. New format requires 12 digits.`,

  MAXIMUM_AGE_REQUIREMENT_NOT_MET: () =>
    `Invalid birth year in the given NIC number. Old format requires a year between ${NICConfig.OLDEST_BIRTH_YEAR_FOR_VALID_NIC} and 1999 (inclusive). New format requires a year between ${NICConfig.OLDEST_BIRTH_YEAR_FOR_VALID_NIC} and the current year minus the minimum legal age (${NICConfig.MINIMUM_LEGAL_AGE_TO_HAVE_NIC}) to have an NIC (inclusive).`,

  MINIMUM_AGE_REQUIREMENT_NOT_MET: () =>
    `Minimum age requirement not met in the given NIC number. The legal age to obtain an NIC in Sri Lanka is ${NICConfig.MINIMUM_LEGAL_AGE_TO_HAVE_NIC} years.`,

  INVALID_DAY_OF_YEAR: () =>
    `Invalid day of the year in the given NIC number. Must be between 001 and 365 or 366 (inclusive) for males, or 501 and 865 or 866 (inclusive) for females.`,

  INVALID_YEAR_FOR_OLD_FORMAT_CONVERSION: (year: string) =>
    `Only 19xx born NICs can be converted to the OLD format. The provided NIC has the birth year ${year}.`,

  SERIAL_NUMBER_TOO_LARGE_FOR_OLD_FORMAT: (serial: string) =>
    `The serial number "${serial}" in this new-format NIC is too large (4 digits starting with 1-9) to fit into the old 3-digit format.`,
};

export type ErrorCodes = keyof typeof errors;
