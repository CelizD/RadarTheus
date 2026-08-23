import { prisma } from "../db.js";

export async function getTopProducts(limit = 10) {
  return prisma.product.findMany({
    where: { active: true },
    include: { category: true },
    orderBy: [{ electroScore: "desc" }, { updatedAt: "desc" }],
    take: limit
  });
}

export async function searchProducts(query: string, limit = 10) {
  return prisma.product.findMany({
    where: {
      active: true,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { brand: { contains: query, mode: "insensitive" } }
      ]
    },
    include: { category: true },
    orderBy: { electroScore: "desc" },
    take: limit
  });
}

export async function getSuppliersForProduct(productId: string) {
  return prisma.supplierOffer.findMany({
    where: { productId, active: true },
    include: { supplier: true, product: true },
    orderBy: [{ supplier: { verified: "desc" } }, { price: "asc" }]
  });
}
