import "dotenv/config";
import { serve } from "@hono/node-server";
import { createApp } from "./app.js";
import { config } from "./config.js";
import { startCronJobs, stopCronJobs } from "./cron/scheduler.js";
import { sql } from "./db/pool.js";

// Initialize Sentry
if (config.sentryDsn) {
  import("@sentry/node").then((Sentry) => {
    Sentry.init({
      dsn: config.sentryDsn,
      tracesSampleRate: 0.1,
      environment: process.env.NODE_ENV || "production",
    });
    console.log("[SENTRY] Initialized");
  });
}

const app = createApp();

// Start cron jobs
startCronJobs();

// Start server
const server = serve(
  { fetch: app.fetch, port: config.port },
  (info) => {
    console.log(`Pennysite server listening on port ${info.port}`);
  },
);

// Graceful shutdown
async function shutdown() {
  console.log("Shutting down...");
  stopCronJobs();
  await sql.end();
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
