import { NICConfig, ResolvedNICConfig } from "../core/nic.types";

export function resolveNICConfig(defaults: ResolvedNICConfig, options?: NICConfig) {
  return {
    minimumAge: options?.minimumAge ?? defaults.minimumAge,
    maximumAge: options?.maximumAge ?? defaults.maximumAge,
    minimumBirthYear: options?.minimumBirthYear ?? defaults.minimumBirthYear,
    maximumBirthYear: options?.maximumBirthYear ?? defaults.maximumBirthYear,
  } as ResolvedNICConfig;
}
