import { NICType } from "./nic";


export interface NICParts {
  year: string;
  days: string;
  serial: string;
  checkdigit: string;
  letter: string | null;
}

function getOldNICParts(nic: string): NICParts {
  return {
    year: `19${nic.substring(0, 2)}`,
    days: nic.substring(2, 5),
    serial: nic.substring(5, 8),
    checkdigit: nic.substring(8, 9),
    letter: nic.substring(9, 10),
  };
}

function getNewNICParts(nic: string): NICParts {
  return {
    year: nic.substring(0, 4),
    days: nic.substring(4, 7),
    serial: nic.substring(7, 11),
    checkdigit: nic.substring(11, 12),
    letter: null,
  };
}

export function getNICParts(nic: string, type: NICType) {
  if (type === NICType.OLD) return getOldNICParts(nic);
  return getNewNICParts(nic);
}
