-- CreateTable
CREATE TABLE "PCProduct" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lineup" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CZK',
    "cpu" TEXT,
    "gpu" TEXT,
    "ram" TEXT,
    "storage" TEXT,
    "cooling" TEXT,
    "psu" TEXT,
    "status" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "images" TEXT,
    "flags" TEXT,
    "shortDescription" TEXT,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PCProduct_sku_key" ON "PCProduct"("sku");

-- CreateIndex
CREATE INDEX "PCProduct_lineup_idx" ON "PCProduct"("lineup");

-- CreateIndex
CREATE INDEX "PCProduct_status_idx" ON "PCProduct"("status");

-- CreateIndex
CREATE INDEX "PCProduct_price_idx" ON "PCProduct"("price");
