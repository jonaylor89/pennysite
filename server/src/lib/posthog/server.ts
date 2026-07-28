import { PostHog } from "posthog-node";

const POSTHOG_KEY = process.env.POSTHOG_KEY;
const POSTHOG_HOST = process.env.POSTHOG_HOST || "https://us.i.posthog.com";

let posthogServer: PostHog | null = null;

export function getPostHogServer(): PostHog | null {
	if (!POSTHOG_KEY) {
		return null;
	}

	if (!posthogServer) {
		posthogServer = new PostHog(POSTHOG_KEY, {
			host: POSTHOG_HOST,
			flushAt: 20,
			flushInterval: 10000,
		});
	}

	return posthogServer;
}

export function trackServerEvent(
	distinctId: string,
	event: string,
	properties?: Record<string, unknown>,
) {
	const client = getPostHogServer();
	if (!client) return;

	client.capture({
		distinctId,
		event,
		properties,
	});
}

export function identifyUser(
	distinctId: string,
	properties?: Record<string, unknown>,
) {
	const client = getPostHogServer();
	if (!client) return;

	client.identify({
		distinctId,
		properties,
	});
}
