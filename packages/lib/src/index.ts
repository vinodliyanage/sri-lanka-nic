export { NIC } from "./core";
export { NICValidator, NICTemplate, NewNIC, OldNIC } from "./core";
export type {
  NICAPI,
  NICConfig,
  ResolvedNICConfig,
  NICInstance,
  PublicNIC,
  InternalNIC,
  NICOptions,
  RawNICParts,
  FormattedNICParts,
  NICLetter,
} from "./core";

export { NewNICBuilder, OldNICBuilder } from "./builder";
export type { NICState, OldNICState } from "./builder/builder.types";

export { NICType, Gender, NICError, daylk, errors, MINIMUM_LEGAL_AGE_TO_HAVE_NIC } from "./common";
export type { Birthday } from "./common";
