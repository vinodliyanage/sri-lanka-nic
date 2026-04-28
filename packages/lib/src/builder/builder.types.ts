import { Gender } from "../common";
import { NICLetter } from "../core/nic.types";

/**
 * Holds the current state while building a NIC string.
 */
export interface NICState {
  serial: string;
  checkdigit: string;
  gender: Gender;
  year: number;
  days: number;
}

export interface OldNICState extends NICState {
  letter: NICLetter;
}
