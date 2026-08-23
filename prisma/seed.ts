import { PrismaClient, SupplierScope, TrendDirection } from "@prisma/client";

const prisma = new PrismaClient();

const OBSERVED_AT = new Date("2026-08-23T18:00:00.000Z");

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
  ] as const;

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
      slug: "power-bank-qi2",
      name: "Power Bank magnético Qi2 (5,000–10,000 mAh)",
      categoryId: mobile.id,
      electroScore: 72,
      trendDirection: TrendDirection.STABLE,
      wholesaleMin: null,
      wholesaleMax: null,
      resaleMin: 710,
      resaleMax: 810,
      riskScore: 45,
      description:
        "Observación real de mercado en Mercado Libre México. Primera medición: todavía no hay historial suficiente para afirmar crecimiento o caída."
    },
    {
      slug: "cargador-gan-65w",
      name: "Cargador GaN USB-C 65W (3 puertos)",
      categoryId: mobile.id,
      electroScore: 78,
      trendDirection: TrendDirection.STABLE,
      wholesaleMin: null,
      wholesaleMax: null,
      resaleMin: 271,
      resaleMax: 738,
      riskScore: 40,
      description:
        "Observación real de mercado en Mercado Libre México. Se detectó una publicación marcada como Más vendido; el score sigue siendo heurístico hasta acumular historial."
    },
    {
      slug: "audifonos-open-ear",
      name: "Audífonos Open-Ear Bluetooth",
      categoryId: audio.id,
      electroScore: 76,
      trendDirection: TrendDirection.STABLE,
      wholesaleMin: null,
      wholesaleMax: null,
      resaleMin: 177,
      resaleMax: 685,
      riskScore: 55,
      description:
        "Observación real de mercado en Mercado Libre México. La categoría muestra mucha oferta; se mantiene tendencia neutral hasta tener varias mediciones temporales."
    }
  ] as const;

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product
    });
  }

  // Desactiva el antiguo registro demo si existe, para que no aparezca como dato real.
  await prisma.supplier.updateMany({
    where: { id: "seed-supplier-tijuana" },
    data: {
      verified: false,
      notes: "Registro DEMO legado. No usar como proveedor real."
    }
  });

  const exel = await prisma.supplier.upsert({
    where: { id: "supplier-exel-del-norte" },
    update: {
      name: "Exel del Norte",
      city: "Monterrey",
      state: "Nuevo León",
      scope: SupplierScope.NATIONAL,
      categories: ["celulares-accesorios", "audio", "gaming", "pc"],
      website: "https://www.exel.com.mx/",
      verified: true,
      notes:
        "Identidad y portal oficial verificados. Mayorista de tecnología; precios y existencias pueden requerir cuenta de distribuidor."
    },
    create: {
      id: "supplier-exel-del-norte",
      name: "Exel del Norte",
      city: "Monterrey",
      state: "Nuevo León",
      scope: SupplierScope.NATIONAL,
      categories: ["celulares-accesorios", "audio", "gaming", "pc"],
      website: "https://www.exel.com.mx/",
      verified: true,
      notes:
        "Identidad y portal oficial verificados. Mayorista de tecnología; precios y existencias pueden requerir cuenta de distribuidor."
    }
  });

  const cva = await prisma.supplier.upsert({
    where: { id: "supplier-grupo-cva" },
    update: {
      name: "Grupo CVA",
      city: "Guadalajara",
      state: "Jalisco",
      scope: SupplierScope.NATIONAL,
      categories: ["celulares-accesorios", "audio", "wearables", "gaming", "pc", "smart-home"],
      website: "https://www.grupocva.com/",
      verified: true,
      notes:
        "Identidad y portal oficial verificados. Mayorista de tecnología con canal de distribución; stock y precios se confirman en su portal."
    },
    create: {
      id: "supplier-grupo-cva",
      name: "Grupo CVA",
      city: "Guadalajara",
      state: "Jalisco",
      scope: SupplierScope.NATIONAL,
      categories: ["celulares-accesorios", "audio", "wearables", "gaming", "pc", "smart-home"],
      website: "https://www.grupocva.com/",
      verified: true,
      notes:
        "Identidad y portal oficial verificados. Mayorista de tecnología con canal de distribución; stock y precios se confirman en su portal."
    }
  });

  const qi2 = await prisma.product.findUniqueOrThrow({ where: { slug: "power-bank-qi2" } });
  const gan = await prisma.product.findUniqueOrThrow({ where: { slug: "cargador-gan-65w" } });
  const openEar = await prisma.product.findUniqueOrThrow({ where: { slug: "audifonos-open-ear" } });

  const snapshots = [
    {
      id: "mlm-2026-08-23-power-bank-qi2",
      productId: qi2.id,
      score: 72,
      demandScore: 68,
      growthScore: 50,
      marginScore: 50,
      supplyScore: 72,
      competition: 68,
      source: "Mercado Libre México — listado /power-bank-qi2 — observado 2026-08-23",
      observedAt: OBSERVED_AT
    },
    {
      id: "mlm-2026-08-23-cargador-gan-65w",
      productId: gan.id,
      score: 78,
      demandScore: 80,
      growthScore: 50,
      marginScore: 50,
      supplyScore: 78,
      competition: 72,
      source: "Mercado Libre México — listado /cargador-65w-gan — observado 2026-08-23",
      observedAt: OBSERVED_AT
    },
    {
      id: "mlm-2026-08-23-audifonos-open-ear",
      productId: openEar.id,
      score: 76,
      demandScore: 74,
      growthScore: 50,
      marginScore: 50,
      supplyScore: 84,
      competition: 82,
      source: "Mercado Libre México — listados /audifonos-open-ear y categoría Open-Ear — observado 2026-08-23",
      observedAt: OBSERVED_AT
    }
  ];

  for (const snapshot of snapshots) {
    await prisma.trendSnapshot.upsert({
      where: { id: snapshot.id },
      update: snapshot,
      create: snapshot
    });
  }

  console.log(
    `RadarTheus: datos base reales cargados (${products.length} productos, 2 mayoristas verificados: ${exel.name}, ${cva.name}).`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
