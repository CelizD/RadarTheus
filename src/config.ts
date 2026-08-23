import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  TELEGRAM_BOT_TOKEN: z.string().min(20),
  TELEGRAM_WEBHOOK_SECRET: z.string().min(8).default("change-me-in-production"),
  TELEGRAM_WEBHOOK_PATH: z.string().startsWith("/").default("/telegram/webhook"),
  PUBLIC_BASE_URL: z.string().url().optional().or(z.literal("")),
  DATABASE_URL: z.string().min(1),
  PRO_PRICE_STARS: z.coerce.number().int().min(1).max(10000).default(15),
  PRO_PERIOD_SECONDS: z.coerce.number().int().default(2592000),
  ADMIN_TELEGRAM_IDS: z.string().default("")
});

const raw = schema.parse(process.env);

export const config = {
  ...raw,
  ADMIN_IDS: new Set(
    raw.ADMIN_TELEGRAM_IDS.split(",")
      .map((value) => value.trim())
      .filter(Boolean)
      .map((value) => BigInt(value))
  )
};
