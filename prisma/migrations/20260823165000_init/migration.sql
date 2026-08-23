CREATE TYPE "Plan" AS ENUM ('FREE', 'PRO');
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'EXPIRED');
CREATE TYPE "TrendDirection" AS ENUM ('RISING', 'STABLE', 'FALLING');
CREATE TYPE "SupplierScope" AS ENUM ('LOCAL', 'STATE', 'NATIONAL', 'IMPORT');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "telegramId" BIGINT NOT NULL,
  "username" TEXT,
  "firstName" TEXT,
  "lastName" TEXT,
  "city" TEXT,
  "state" TEXT,
  "plan" "Plan" NOT NULL DEFAULT 'FREE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Subscription" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
  "starsAmount" INTEGER NOT NULL,
  "telegramPaymentChargeId" TEXT NOT NULL,
  "providerPaymentChargeId" TEXT,
  "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "autoRenew" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Category" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Product" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "brand" TEXT,
  "categoryId" TEXT NOT NULL,
  "description" TEXT,
  "electroScore" INTEGER NOT NULL DEFAULT 0,
  "trendDirection" "TrendDirection" NOT NULL DEFAULT 'STABLE',
  "wholesaleMin" DECIMAL(10,2),
  "wholesaleMax" DECIMAL(10,2),
  "resaleMin" DECIMAL(10,2),
  "resaleMax" DECIMAL(10,2),
  "riskScore" INTEGER NOT NULL DEFAULT 50,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TrendSnapshot" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "score" INTEGER NOT NULL,
  "demandScore" INTEGER NOT NULL,
  "growthScore" INTEGER NOT NULL,
  "marginScore" INTEGER NOT NULL,
  "supplyScore" INTEGER NOT NULL,
  "competition" INTEGER NOT NULL,
  "source" TEXT NOT NULL,
  "observedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TrendSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Supplier" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "city" TEXT,
  "state" TEXT,
  "scope" "SupplierScope" NOT NULL DEFAULT 'NATIONAL',
  "website" TEXT,
  "whatsapp" TEXT,
  "telegram" TEXT,
  "address" TEXT,
  "verified" BOOLEAN NOT NULL DEFAULT false,
  "rating" DECIMAL(3,2),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SupplierOffer" (
  "id" TEXT NOT NULL,
  "supplierId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "price" DECIMAL(10,2),
  "minimumQty" INTEGER,
  "shippingMx" BOOLEAN NOT NULL DEFAULT false,
  "sourceUrl" TEXT,
  "lastChecked" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "active" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "SupplierOffer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Watchlist" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "minScore" INTEGER NOT NULL DEFAULT 80,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Watchlist_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");
CREATE UNIQUE INDEX "Subscription_telegramPaymentChargeId_key" ON "Subscription"("telegramPaymentChargeId");
CREATE INDEX "Subscription_userId_status_idx" ON "Subscription"("userId", "status");
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE INDEX "Product_electroScore_idx" ON "Product"("electroScore");
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX "TrendSnapshot_productId_observedAt_idx" ON "TrendSnapshot"("productId", "observedAt");
CREATE INDEX "Supplier_state_city_idx" ON "Supplier"("state", "city");
CREATE UNIQUE INDEX "SupplierOffer_supplierId_productId_key" ON "SupplierOffer"("supplierId", "productId");
CREATE INDEX "SupplierOffer_productId_price_idx" ON "SupplierOffer"("productId", "price");
CREATE UNIQUE INDEX "Watchlist_userId_productId_key" ON "Watchlist"("userId", "productId");

ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TrendSnapshot" ADD CONSTRAINT "TrendSnapshot_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SupplierOffer" ADD CONSTRAINT "SupplierOffer_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SupplierOffer" ADD CONSTRAINT "SupplierOffer_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Watchlist" ADD CONSTRAINT "Watchlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Watchlist" ADD CONSTRAINT "Watchlist_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
