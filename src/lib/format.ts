import type { Category, Product } from "@prisma/client";

type ProductWithCategory = Product & { category: Category };

function money(value: unknown) {
  if (value == null) return "N/D";

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  }).format(Number(value));
}

export function trendEmoji(score: number) {
  if (score >= 90) return "🔥";
  if (score >= 80) return "📈";
  if (score >= 65) return "🟡";
  return "⚪";
}

export function formatProduct(product: ProductWithCategory, index?: number) {
  const prefix = index ? `${index}. ` : "";

  return [
    `${prefix}${trendEmoji(product.electroScore)} ${product.name}`,
    `   ElectroScore: ${product.electroScore}/100`,
    `   Categoría: ${product.category.name}`,
    `   Mayoreo: ${money(product.wholesaleMin)} – ${money(product.wholesaleMax)}`,
    `   Reventa: ${money(product.resaleMin)} – ${money(product.resaleMax)}`
  ].join("\n");
}
