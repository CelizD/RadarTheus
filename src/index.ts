import express from "express";
import { webhookCallback } from "grammy";
import { bot } from "./bot.js";
import { config } from "./config.js";
import { prisma } from "./db.js";

const app = express();
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ name: "RadarTheus", status: "ok", version: "0.1.0" });
});

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ ok: true, database: "ok" });
  } catch {
    res.status(503).json({ ok: false, database: "error" });
  }
});

app.use(
  config.TELEGRAM_WEBHOOK_PATH,
  (req, res, next) => {
    const header = req.header("x-telegram-bot-api-secret-token");
    if (config.NODE_ENV === "production" && header !== config.TELEGRAM_WEBHOOK_SECRET) {
      res.status(401).json({ error: "invalid webhook secret" });
      return;
    }
    next();
  },
  webhookCallback(bot, "express")
);

async function configureTelegram() {
  if (config.NODE_ENV !== "production") {
    console.log("Development mode: starting long polling.");
    await bot.start({ onStart: (info) => console.log(`RadarTheus @${info.username} iniciado.`) });
    return;
  }

  if (!config.PUBLIC_BASE_URL) throw new Error("PUBLIC_BASE_URL es obligatorio en producción.");
  if (config.TELEGRAM_WEBHOOK_SECRET === "change-me-in-production") {
    throw new Error("Configura TELEGRAM_WEBHOOK_SECRET antes de producción.");
  }

  const url = `${config.PUBLIC_BASE_URL.replace(/\/$/, "")}${config.TELEGRAM_WEBHOOK_PATH}`;
  await bot.api.setWebhook(url, {
    secret_token: config.TELEGRAM_WEBHOOK_SECRET,
    allowed_updates: ["message", "callback_query", "pre_checkout_query"]
  });
  console.log(`Webhook configurado: ${url}`);
}

const server = app.listen(config.PORT, () => {
  console.log(`RadarTheus escuchando en puerto ${config.PORT}`);
});

configureTelegram().catch((error) => {
  console.error("No se pudo iniciar/configurar Telegram:", error);
  process.exitCode = 1;
});

async function shutdown(signal: string) {
  console.log(`${signal}: cerrando RadarTheus...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
