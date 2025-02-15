import featureData from "~~/feat/feature-flags.json"

import type {
  FeatureState,
  FlagStatus,
  Storage,
} from "#shared/constants/feature-flag"
import type { DeployEnv } from "#shared/constants/deploy-env"

export type FlagName = keyof (typeof featureData)["features"]

export function isFlagName(flag: string): flag is FlagName {
  return flag in featureData.features
}

export type FlagStatusRecord = string | Partial<Record<DeployEnv, string>>
/**
 * The record of a feature flag from the json file.
 */
export interface FeatureFlagRecord {
  status: FlagStatusRecord
  description?: string
  data?: unknown

  defaultState?: FeatureState

  supportsQuery?: boolean // default: true

  storage: Storage
}

/**
 * The feature flag with the status resolved based on the current environment.
 */
export type FeatureFlag = Omit<FeatureFlagRecord, "status"> & {
  name: keyof (typeof featureData)["features"]
  status: FlagStatus
  state: FeatureState
  preferredState: FeatureState | undefined
}
