import posthog from "posthog-js";

export type FeatureFlag = "multimodal-prompt";

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return posthog.isFeatureEnabled(flag) ?? false;
}
