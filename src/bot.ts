import { Bot, Context, InlineKeyboard } from "grammy";
import { config } from "./config.js";
import { formatProduct } from "./lib/format.js";
import { createProInvoiceLink } from "./services/invoices.js";
import { activateProFromPayment, hasProAccess } from "./services/pro.js";
import {
  getSuppliersForProduct,
  getTopProducts,
  getVerifiedSuppliersForCategory,
  searchProducts
} from "./services/trends.js";
import { getUserByTelegramId, upsertTelegramUser } from "./services/users.js";

export const bot = new Bot(config.TELEGRAM_BOT_TOKEN);

function getTelegramUserId(ctx: Context): number | null {
  return ctx.from?.id ?? null;
}

async function requireTelegramUserId(ctx: Context): Promise<number | null> {
  const telegramId = getTelegramUserId(ctx);
  if (telegramId !== null) return telegramId;

  if (ctx.chat) {
    await ctx.reply("No pude identificar tu usuario de Telegram. Intenta abrir el bot en un chat privado.");
  }

  return null;
}

bot.use(async (ctx, next) => {
  if (ctx.from) await upsertTelegramUser(ctx.from);
  await next();
});

bot.command("start", async (ctx) => {
  const keyboard = new InlineKeyboard()
    .text("🔥 Tendencias", "trends")
    .text("⭐ Ver PRO", "pro")
    .row()
    .text("📦 Proveedores", "suppliers")
    .text("💰 Invertir", "invest");

  await ctx.reply([
    "⚡ RADARTHEUS 🇲🇽",
    "",
    "Radar nacional de oportunidades de reventa de electrónica.",
    "",
    "Descubre:",
    "🔥 señales actuales de mercado",
    "📦 mayoristas verificados por categoría",
    "💰 precios de mercado observados",
    "📊 ElectroScore con historial",
    "",
    "Comandos:",
    "/hoy — mejores oportunidades",
    "/buscar <producto> — buscar producto",
    "/proveedores <producto> — buscar proveedores",
    "/pro — membresía PRO",
    "/mi_plan — estado de tu cuenta"
  ].join("\n"), { reply_markup: keyboard });
});

bot.command("hoy", async (ctx) => {
  const telegramId = await requireTelegramUserId(ctx);
  if (telegramId === null) return;

  const isPro = await hasProAccess(telegramId);
  const products = await getTopProducts(isPro ? 10 : 3);

  if (!products.length) {
    await ctx.reply("Todavía no hay observaciones de mercado cargadas.");
    return;
  }

  const title = isPro ? "🏆 TOP OPORTUNIDADES — PRO" : "🔥 VISTA GRATIS — TOP 3";
  const body = products.map((product, index) => formatProduct(product, index + 1)).join("\n\n");
  const footer = isPro ? "" : "\n\n🔒 PRO desbloquea el Top 10, proveedores y alertas.\nUsa /pro";
  await ctx.reply(`${title}\n\n${body}${footer}`);
});

bot.command("tendencias", async (ctx) => {
  const telegramId = await requireTelegramUserId(ctx);
  if (telegramId === null) return;

  const products = await getTopProducts((await hasProAccess(telegramId)) ? 10 : 3);
  await ctx.reply(products.map((product, index) => formatProduct(product, index + 1)).join("\n\n") || "No hay observaciones todavía.");
});

bot.command("buscar", async (ctx) => {
  const telegramId = await requireTelegramUserId(ctx);
  if (telegramId === null) return;

  const query = ctx.match?.trim();
  if (!query) {
    await ctx.reply("Uso: /buscar power bank");
    return;
  }

  const results = await searchProducts(query, (await hasProAccess(telegramId)) ? 10 : 3);
  if (!results.length) {
    await ctx.reply(`No encontré productos para: ${query}`);
    return;
  }

  await ctx.reply(results.map((product, index) => formatProduct(product, index + 1)).join("\n\n"));
});

bot.command("proveedores", async (ctx) => {
  const telegramId = await requireTelegramUserId(ctx);
  if (telegramId === null) return;

  if (!(await hasProAccess(telegramId))) {
    await ctx.reply("🔒 La búsqueda completa de proveedores es una función PRO.\nUsa /pro para desbloquearla.");
    return;
  }

  const query = ctx.match?.trim();
  if (!query) {
    await ctx.reply("Uso: /proveedores power bank");
    return;
  }

  const products = await searchProducts(query, 1);
  if (!products.length) {
    await ctx.reply(`No encontré el producto: ${query}`);
    return;
  }

  const product = products[0];
  const offers = await getSuppliersForProduct(product.id);

  if (offers.length) {
    const body = offers.map((offer, index) => {
      const verified = offer.supplier.verified ? "✅ Identidad verificada" : "⚠️ Sin verificar";
      const location = [offer.supplier.city, offer.supplier.state].filter(Boolean).join(", ");
      const price = offer.price ? `$${Number(offer.price).toFixed(0)} MXN` : "Consultar";
      return [
        `${index + 1}. ${offer.supplier.name}`,
        `   ${verified}`,
        `   📍 ${location || "México"}`,
        `   💰 Mayoreo: ${price}`,
        `   📦 Mínimo: ${offer.minimumQty ?? "Consultar"}`,
        `   🚚 Envío nacional: ${offer.shippingMx ? "Sí" : "Consultar"}`,
        offer.sourceUrl ? `   🔗 ${offer.sourceUrl}` : null
      ].filter(Boolean).join("\n");
    }).join("\n\n");

    await ctx.reply(`📦 PROVEEDORES — ${product.name}\n\n${body}`);
    return;
  }

  const suppliers = await getVerifiedSuppliersForCategory(product.category.slug, 10);
  if (!suppliers.length) {
    await ctx.reply(`📦 ${product.name}\n\nTodavía no tenemos mayoristas verificados para esta categoría.`);
    return;
  }

  const body = suppliers.map((supplier, index) => {
    const location = [supplier.city, supplier.state].filter(Boolean).join(", ");
    return [
      `${index + 1}. ${supplier.name}`,
      "   ✅ Identidad y portal oficial verificados",
      `   📍 ${location || "México"}`,
      `   🌐 ${supplier.website ?? "Sitio no disponible"}`,
      "   💰 Precio/stock: confirmar con cuenta de distribuidor"
    ].join("\n");
  }).join("\n\n");

  await ctx.reply([
    `📦 MAYORISTAS RELACIONADOS — ${product.name}`,
    "",
    body,
    "",
    "ℹ️ Son mayoristas reales relacionados con la categoría. RadarTheus no afirma que tengan ese SKU exacto hasta verificar inventario y precio."
  ].join("\n"));
});

bot.command("pro", async (ctx) => {
  const telegramId = await requireTelegramUserId(ctx);
  if (telegramId === null) return;

  if (await hasProAccess(telegramId)) {
    await ctx.reply("👑 Ya tienes RadarTheus PRO activo.");
    return;
  }

  try {
    const invoiceUrl = await createProInvoiceLink(telegramId);
    const keyboard = new InlineKeyboard().url(`⭐ Suscribirme por ${config.PRO_PRICE_STARS} Stars`, invoiceUrl);
    await ctx.reply([
      "👑 RADARTHEUS PRO",
      "",
      "✅ Top 10 completo",
      "✅ Mayoristas verificados",
      "✅ Precios de mercado observados",
      "✅ Búsquedas ampliadas",
      "✅ Próximamente: alertas y Watchlist",
      "",
      "La suscripción se renueva cada 30 días mediante Telegram Stars."
    ].join("\n"), { reply_markup: keyboard });
  } catch (error) {
    console.error(error);
    await ctx.reply("No pude generar el enlace de pago en este momento.");
  }
});

bot.command("mi_plan", async (ctx) => {
  const telegramId = await requireTelegramUserId(ctx);
  if (telegramId === null) return;

  const user = await getUserByTelegramId(telegramId);
  const pro = await hasProAccess(telegramId);
  await ctx.reply([
    "👤 MI CUENTA",
    "",
    `Plan: ${pro ? "👑 PRO" : "🆓 FREE"}`,
    `Ciudad: ${user?.city ?? "Sin configurar"}`,
    `Estado: ${user?.state ?? "Sin configurar"}`
  ].join("\n"));
});

bot.command("invertir", async (ctx) => {
  const telegramId = await requireTelegramUserId(ctx);
  if (telegramId === null) return;

  if (!(await hasProAccess(telegramId))) {
    await ctx.reply("🔒 /invertir es una función PRO. Usa /pro.");
    return;
  }

  const amount = Number(ctx.match?.replace(/[,$\s]/g, ""));
  if (!Number.isFinite(amount) || amount < 500) {
    await ctx.reply("Uso: /invertir 5000");
    return;
  }

  const products = await getTopProducts(10);
  const withVerifiedWholesale = products.filter((product) => product.wholesaleMin != null);

  if (!withVerifiedWholesale.length) {
    await ctx.reply([
      `💰 PRESUPUESTO: $${amount.toLocaleString("es-MX")} MXN`,
      "",
      "Todavía no hay suficientes costos mayoristas verificados para calcular una compra responsable.",
      "No voy a inventar precios ni cantidades.",
      "",
      "Puedes usar /hoy para ver precios de mercado observados mientras incorporamos cotizaciones mayoristas verificadas."
    ].join("\n"));
    return;
  }

  const perProduct = amount / withVerifiedWholesale.length;
  const rows = withVerifiedWholesale.map((product, index) => {
    const unit = Number(product.wholesaleMin);
    const qty = Math.max(1, Math.floor(perProduct / unit));
    return `${index + 1}. ${product.name}\n   Aproximado: ${qty} unidades desde ${unit.toLocaleString("es-MX", { style: "currency", currency: "MXN" })}`;
  });

  await ctx.reply([
    `💰 PRESUPUESTO: $${amount.toLocaleString("es-MX")} MXN`,
    "",
    "Cálculo basado únicamente en costos mayoristas verificados:",
    "",
    ...rows,
    "",
    "⚠️ Revisa comisiones, envío, impuestos y stock antes de comprar."
  ].join("\n"));
});

bot.callbackQuery("trends", async (ctx) => {
  await ctx.answerCallbackQuery();
  const telegramId = await requireTelegramUserId(ctx);
  if (telegramId === null) return;

  const products = await getTopProducts((await hasProAccess(telegramId)) ? 10 : 3);
  await ctx.reply(products.map((product, index) => formatProduct(product, index + 1)).join("\n\n"));
});

bot.callbackQuery("pro", async (ctx) => {
  await ctx.answerCallbackQuery();
  const telegramId = await requireTelegramUserId(ctx);
  if (telegramId === null) return;

  if (await hasProAccess(telegramId)) {
    await ctx.reply("👑 Ya eres PRO.");
    return;
  }
  const invoiceUrl = await createProInvoiceLink(telegramId);
  const keyboard = new InlineKeyboard().url("⭐ Activar PRO", invoiceUrl);
  await ctx.reply("Desbloquea todas las oportunidades y proveedores.", { reply_markup: keyboard });
});

bot.callbackQuery("suppliers", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply("Escribe: /proveedores <producto>\nEjemplo: /proveedores power bank");
});

bot.callbackQuery("invest", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply("Escribe: /invertir 5000");
});

bot.on("pre_checkout_query", async (ctx) => {
  await ctx.answerPreCheckoutQuery(true);
});

bot.on("message:successful_payment", async (ctx) => {
  const telegramId = await requireTelegramUserId(ctx);
  if (telegramId === null) return;

  const payment = ctx.message.successful_payment;
  if (payment.currency !== "XTR") return;

  const expiresAt = await activateProFromPayment({
    telegramId,
    starsAmount: payment.total_amount,
    telegramPaymentChargeId: payment.telegram_payment_charge_id,
    providerPaymentChargeId: payment.provider_payment_charge_id
  });

  await ctx.reply(`👑 ¡RadarTheus PRO activado!\n\nAcceso vigente hasta: ${expiresAt.toLocaleDateString("es-MX")}`);
});

bot.catch((error) => {
  console.error("RadarTheus Telegram error:", error.error);
});
