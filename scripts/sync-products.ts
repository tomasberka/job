/**
 * Shoptet Product Sync Script
 * ============================
 * 
 * Fetches products from Shoptet XML feed and saves to database.
 * Run with: npm run sync-products
 * 
 * This allows products to persist even when the server is offline.
 */

import { getShoptetProducts } from "../src/features/pc-inventory/services/shoptet-xml-service";
import prisma from "../src/lib/prisma";

async function syncProducts() {
    console.log("🔄 Starting product sync from Shoptet XML...\n");

    try {
        // Fetch products from Shoptet XML
        console.log("📥 Fetching products from Shoptet XML feed...");
        const products = await getShoptetProducts();
        console.log(`✅ Fetched ${products.length} products from XML\n`);

        // Clear existing products
        console.log("🗑️  Clearing existing products from database...");
        await prisma.pCProduct.deleteMany({});
        console.log("✅ Database cleared\n");

        // Insert products in batches
        console.log("💾 Inserting products into database...");
        const batchSize = 50;
        let inserted = 0;

        for (let i = 0; i < products.length; i += batchSize) {
            const batch = products.slice(i, i + batchSize);

            await prisma.pCProduct.createMany({
                data: batch.map(product => ({
                    id: product.id,
                    sku: product.sku,
                    name: product.name,
                    lineup: product.lineup,
                    price: product.price,
                    currency: product.currency,
                    cpu: product.specs.cpu,
                    gpu: product.specs.gpu,
                    ram: product.specs.ram,
                    storage: product.specs.storage,
                    cooling: product.specs.cooling,
                    psu: product.specs.psu,
                    status: product.status,
                    stock: product.stock,
                    imageUrl: product.imageUrl,
                    images: product.images ? JSON.stringify(product.images) : null,
                    flags: product.flags ? JSON.stringify(product.flags) : null,
                    shortDescription: product.shortDescription,
                    tags: JSON.stringify(product.tags),
                })),
                skipDuplicates: true,
            });

            inserted += batch.length;
            console.log(`  ✓ Inserted ${inserted}/${products.length} products`);
        }

        console.log(`\n✅ Successfully synced ${inserted} products to database!`);
        console.log(`📊 Database location: prisma/dev.db`);
        console.log(`\n💡 Products are now stored persistently and will be available even when offline.\n`);

    } catch (error) {
        console.error("❌ Error syncing products:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Run sync
syncProducts();
