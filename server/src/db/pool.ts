import postgres from "postgres";
import { config } from "../config.js";

export const sql = postgres(config.databaseUrl, {
  max: 20,
  idle_timeout: 30,
  connect_timeout: 10,
});
