export { NIC } from "./core";
export type {
  NICAPI,
  NICConfig,
  ResolvedNICConfig,
  NICValidatorConfig,
  NICInstance,
  NICOptions,
  RawNICParts,
  NICLetter,
} from "./core";

export { NewNICBuilder, OldNICBuilder } from "./builder";

export { NICType, Gender, NICError, MINIMUM_LEGAL_AGE_TO_HAVE_NIC } from "./common";
export type { Birthday } from "./common";
