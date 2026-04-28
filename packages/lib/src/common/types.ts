/**
 * The type of the NIC format (Old or New).
 */
export enum NICType {
  OLD = "OLD",
  NEW = "NEW",
}

/**
 * The gender extracted from the NIC.
 */
export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

/**
 * The parsed date of birth.
 */
export interface Birthday {
  year: number;
  /** 1-indexed (1 = January, 12 = December). */
  month: number;
  day: number;
}
