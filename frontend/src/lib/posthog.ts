import posthog from "posthog-js";

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;

if (POSTHOG_KEY) {
	posthog.init(POSTHOG_KEY, {
		api_host: "/ingest",
		ui_host: import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com",
		person_profiles: "identified_only",
		capture_pageview: "history_change",
		capture_pageleave: true,
	});
}

export { posthog };

export function captureEvent(
	event: string,
	properties?: Record<string, unknown>,
) {
	posthog.capture(event, properties);
}

export function identifyUser(
	distinctId: string,
	properties?: Record<string, unknown>,
) {
	posthog.identify(distinctId, properties);
}
