import type { Category, Product, TrendSnapshot } from "@prisma/client";

type ProductWithCategory = Product & {
  category: Category;
  trendSnapshots?: TrendSnapshot[];
};

function money(value: unknown) {
  if (value == null) return "N/D";

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  }).format(Number(value));
}

function observedDate(product: ProductWithCategory) {
  const observedAt = product.trendSnapshots?.[0]?.observedAt;
  if (!observedAt) return null;

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "America/Mexico_City"
  }).format(observedAt);
}

export function trendEmoji(score: number) {
  if (score >= 90) return "🔥";
  if (score >= 80) return "📈";
  if (score >= 65) return "🟡";
  return "⚪";
}

export function formatProduct(product: ProductWithCategory, index?: number) {
  const prefix = index ? `${index}. ` : "";
  const observed = observedDate(product);

  return [
    `${prefix}${trendEmoji(product.electroScore)} ${product.name}`,
    `   ElectroScore: ${product.electroScore}/100`,
    `   Categoría: ${product.category.name}`,
    `   Mayoreo verificado: ${money(product.wholesaleMin)} – ${money(product.wholesaleMax)}`,
    `   Mercado observado: ${money(product.resaleMin)} – ${money(product.resaleMax)}`,
    observed ? `   🕒 Observado: ${observed}` : null,
    product.trendDirection === "STABLE"
      ? "   ↔️ Tendencia: neutral hasta acumular historial"
      : `   Tendencia: ${product.trendDirection}`
  ].filter(Boolean).join("\n");
}
