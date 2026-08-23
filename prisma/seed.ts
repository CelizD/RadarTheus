import { PrismaClient, SupplierScope, TrendDirection } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const categories = [
    ["celulares-accesorios", "Celulares y accesorios"],
    ["audio", "Audio"],
    ["wearables", "Wearables"],
    ["gaming", "Gaming"],
    ["pc", "PC y laptops"],
    ["smart-home", "Smart Home"],
    ["auto", "Electrónica para automóvil"],
    ["gadgets", "Gadgets"]
  ];

  for (const [slug, name] of categories) {
    await prisma.category.upsert({
      where: { slug },
      update: { name },
      create: { slug, name }
    });
  }

  const mobile = await prisma.category.findUniqueOrThrow({
    where: { slug: "celulares-accesorios" }
  });
  const audio = await prisma.category.findUniqueOrThrow({ where: { slug: "audio" } });

  const products = [
    {
      slug: "power-bank-qi2-10000",
      name: "Power Bank magnético Qi2 10,000 mAh",
      categoryId: mobile.id,
      electroScore: 92,
      trendDirection: TrendDirection.RISING,
      wholesaleMin: 280,
      wholesaleMax: 340,
      resaleMin: 499,
      resaleMax: 599,
      riskScore: 28,
      description: "Producto DEMO para validar la experiencia del bot."
    },
    {
      slug: "cargador-gan-65w",
      name: "Cargador GaN USB-C 65W",
      categoryId: mobile.id,
      electroScore: 86,
      trendDirection: TrendDirection.RISING,
      wholesaleMin: 220,
      wholesaleMax: 320,
      resaleMin: 449,
      resaleMax: 649,
      riskScore: 25,
      description: "Producto DEMO para validar la experiencia del bot."
    },
    {
      slug: "audifonos-open-ear",
      name: "Audífonos Open-Ear",
      categoryId: audio.id,
      electroScore: 89,
      trendDirection: TrendDirection.RISING,
      wholesaleMin: 180,
      wholesaleMax: 300,
      resaleMin: 399,
      resaleMax: 699,
      riskScore: 38,
      description: "Producto DEMO para validar la experiencia del bot."
    }
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product
    });
  }

  const supplier = await prisma.supplier.upsert({
    where: { id: "seed-supplier-tijuana" },
    update: {},
    create: {
      id: "seed-supplier-tijuana",
      name: "Proveedor DEMO Tijuana",
      city: "Tijuana",
      state: "Baja California",
      scope: SupplierScope.LOCAL,
      verified: false,
      notes: "DEMO. Reemplazar por proveedores verificados antes de publicar."
    }
  });

  const qi2 = await prisma.product.findUniqueOrThrow({
    where: { slug: "power-bank-qi2-10000" }
  });

  await prisma.supplierOffer.upsert({
    where: {
      supplierId_productId: {
        supplierId: supplier.id,
        productId: qi2.id
      }
    },
    update: {},
    create: {
      supplierId: supplier.id,
      productId: qi2.id,
      price: 310,
      minimumQty: 5,
      shippingMx: false
    }
  });

  console.log("Seed de RadarTheus listo.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
