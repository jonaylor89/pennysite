import { cors } from "hono/cors";
import { config } from "../config.js";

export const corsMiddleware = cors({
  origin: config.corsOrigins,
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400,
});
