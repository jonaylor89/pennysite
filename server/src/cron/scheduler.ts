import { runEmailCampaign } from "./email-campaign.js";

let cronInterval: ReturnType<typeof setInterval> | null = null;
let lastRunDate: string | null = null;

/**
 * Start the internal cron scheduler.
 * Checks every 60 seconds; runs daily email campaign at 14:00 UTC.
 */
export function startCronJobs() {
	console.log("[CRON] Scheduler started (daily at 14:00 UTC)");

	cronInterval = setInterval(async () => {
		const now = new Date();
		const todayKey = now.toISOString().slice(0, 10);

		// Run at 14:00 UTC, once per day
		if (
			now.getUTCHours() === 14 &&
			now.getUTCMinutes() === 0 &&
			lastRunDate !== todayKey
		) {
			lastRunDate = todayKey;
			console.log(`[CRON] Running daily email campaign (${todayKey})`);
			try {
				const results = await runEmailCampaign();
				console.log("[CRON] Email campaign results:", results);
			} catch (err) {
				console.error("[CRON] Email campaign failed:", err);
			}
		}
	}, 60_000);
}

export function stopCronJobs() {
	if (cronInterval) {
		clearInterval(cronInterval);
		cronInterval = null;
	}
}
