# @sri-lanka/nic

## 1.3.0

### Minor Changes

- b85ed38: ### New Features
  - Exposed `NIC.defaultConfig` to access default validation boundaries for both new and old NIC formats
  - Added `onlyNew` and `onlyOld` options to `NICValidatorConfig` for restricting validation to a specific NIC type
  - Added new `RESTRICTED_NIC_TYPE` error when type restrictions are violated
  - Exported `NICValidatorConfig` type
  - Parsed NIC instances now expose a `.config` getter returning the resolved validation boundaries used during parsing

  ### Refactored
  - Centralized config resolution into a shared `resolveNICConfig` utility, replacing the `resolveConfig` method on `BaseNIC`
  - `NewNIC` and `OldNIC` now resolve config eagerly in the constructor instead of lazily via a getter
  - Builder factory (`NIC.builder.new()` / `NIC.builder.old()`) now accepts `NICConfig` instead of `NICOptions`
  - Validator now destructures `onlyNew`, `onlyOld`, and `check` together instead of extracting `check` separately
  - Improved JSDoc comments across `NICConfig`, `NICValidatorConfig`, and `NICOptions`

  ### Removed from Public API
  - Removed direct exports: `NICValidator`, `NICTemplate` (`BaseNIC`), `NewNIC`, `OldNIC`
  - Removed type exports: `PublicNIC`, `InternalNIC`, `FormattedNICParts`, `NICState`, `OldNICState`
  - Removed utility exports: `daylk`, `errors`
  - Renamed `PublicNIC` to `NICInstance` in public API (type alias preserved internally)

## 1.2.1

### Patch Changes

- 576eb8b: Optimize build size by enabling minification and removing sourcemaps.

## 1.2.0

### Minor Changes

- 9a76512: Refactored builder architecture to extract BaseNICBuilder, simplified types, and added runtime validation for builder methods.
