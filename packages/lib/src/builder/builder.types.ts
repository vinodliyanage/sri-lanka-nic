import { Gender } from "../common";
import { NICLetter } from "../core/nic.types";

/**
 * Holds the current state while building a NIC string.
 */
export interface NICBuildingState {
  serial: string;
  checkdigit: string;
  gender: Gender;
  year: number;
  days: number;
  letter?: NICLetter;
}
