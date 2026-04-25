import { Birthday, Gender } from "../common";
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

/**
 * A chainable builder to create a New (12-digit) NIC string.
 */
export interface NICBuilder {
  serial(serial: string): this;
  checkdigit(checkdigit: string): this;
  gender(gender: Gender): this;
  birthday(birthday: Birthday): this;
  age(age: number): this;
  /**
   * Generates and returns the final NIC string.
   */
  build(): string;
}

/**
 * A chainable builder to create an Old (9-digit) NIC string.
 */
export interface OldNICBuilderContract extends NICBuilder {
  /**
   * Sets the letter at the end of the NIC (V or X).
   */
  letter(letter: NICLetter): this;

  /**
   * Shortcut to set the letter. Pass `true` for 'V' (voter), `false` for 'X' (non-voter).
   */
  voter(voter: boolean): this;
}
