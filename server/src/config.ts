function requireEnv(name: string): string {
	const value = process.env[name];
	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`);
	}
	return value;
}

export const config = {
	port: Number(process.env.PORT || 3001),
	databaseUrl: requireEnv("DATABASE_URL"),
	jwtSecret: requireEnv("JWT_SECRET"),
	siteUrl: process.env.SITE_URL || "https://pennysite.app",
	corsOrigins: (
		process.env.CORS_ORIGINS || "http://localhost:3000,https://pennysite.app"
	).split(","),

	// Stripe
	stripeSecretKey: requireEnv("STRIPE_SECRET_KEY"),
	stripeWebhookSecret: requireEnv("STRIPE_WEBHOOK_SECRET"),
	stripePriceStarter: process.env.STRIPE_PRICE_STARTER || "",
	stripePriceBasic: process.env.STRIPE_PRICE_BASIC || "",
	stripePricePro: process.env.STRIPE_PRICE_PRO || "",
	stripePriceMax: process.env.STRIPE_PRICE_MAX || "",

	// Credit pricing
	baseCreditsPerGeneration: Number(
		process.env.BASE_CREDITS_PER_GENERATION || 5,
	),
	creditsPerInputToken: Number(process.env.CREDITS_PER_INPUT_TOKEN || 0.001),
	creditsPerOutputToken: Number(process.env.CREDITS_PER_OUTPUT_TOKEN || 0.005),
	maxReservedCredits: Number(process.env.MAX_RESERVED_CREDITS || 150),
	enhanceReservedCredits: Number(process.env.ENHANCE_RESERVED_CREDITS || 30),

	// Cloudflare
	cloudflareAccountId: process.env.CLOUDFLARE_ACCOUNT_ID || "",
	cloudflareApiToken: process.env.CLOUDFLARE_API_TOKEN || "",

	// AI
	openaiApiKey: process.env.OPENAI_API_KEY,
	anthropicApiKey: process.env.ANTHROPIC_API_KEY,

	// Email
	resendApiKey: process.env.RESEND_API_KEY,
	resendFromEmail:
		process.env.RESEND_FROM_EMAIL || "Pennysite <noreply@pennysite.app>",

	// Analytics
	posthogKey: process.env.POSTHOG_KEY,
	posthogHost: process.env.POSTHOG_HOST || "https://us.i.posthog.com",

	// Sentry
	sentryDsn: process.env.SENTRY_DSN,

	// Cron
	cronSecret: process.env.CRON_SECRET || crypto.randomUUID(),
} as const;
