export class NICConfig {
  /**
   * The minimum legal age to hold a NIC in Sri Lanka is 15 years.
   * This value is used to validate the birth year.
   * "Every person who is a citizen of Sri Lanka and who has attained or attains the age of 15 years shall apply for a National Identity card."
   * @see https://drp.gov.lk/en/normal.php
   */
  static MINIMUM_LEGAL_AGE_TO_HAVE_NIC = 15;

  /**
   * The oldest birth year considered valid. NICs with birth years before this are invalid.
   */
  static OLDEST_BIRTH_YEAR_FOR_VALID_NIC = 1901;
}
