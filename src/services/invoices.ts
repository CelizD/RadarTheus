import { config } from "../config.js";

type TelegramResponse<T> = {
  ok: boolean;
  result?: T;
  description?: string;
};

export async function createProInvoiceLink(telegramId: number): Promise<string> {
  const endpoint = `https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}/createInvoiceLink`;

  const payload = {
    title: "RadarTheus PRO",
    description: "30 días de acceso PRO a tendencias, proveedores y oportunidades.",
    payload: `pro_30d:${telegramId}:${Date.now()}`,
    provider_token: "",
    currency: "XTR",
    prices: [
      {
        label: "RadarTheus PRO",
        amount: config.PRO_PRICE_STARS
      }
    ],
    subscription_period: config.PRO_PERIOD_SECONDS
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });

  const body = (await response.json()) as TelegramResponse<string>;

  if (!body.ok || !body.result) {
    throw new Error(body.description ?? "No se pudo crear la factura PRO.");
  }

  return body.result;
}
