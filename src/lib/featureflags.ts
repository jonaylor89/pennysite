import posthog from "posthog-js";
import { useEffect, useState } from "react";

export type FeatureFlag = "multimodal-prompt";

/**
 * Hook that safely reads a PostHog feature flag.
 * Returns `false` during SSR and on first client render (avoiding hydration
 * mismatch), then updates once PostHog has loaded flags.
 */
export function useFeatureFlag(flag: FeatureFlag): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // PostHog may not have loaded flags yet. Check immediately, then
    // subscribe to updates so we pick up async flag loads.
    setEnabled(posthog.isFeatureEnabled(flag) ?? false);

    return posthog.onFeatureFlags(() => {
      setEnabled(posthog.isFeatureEnabled(flag) ?? false);
    });
  }, [flag]);

  return enabled;
}
