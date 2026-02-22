/**
 * Shoptet Product Sync Script - JSON Cache Version
 * =================================================
 * 
 * Fetches products from Shoptet XML feed and saves to JSON file.
 * Run with: npm run sync-products
 * 
 * This allows products to persist even when the server is offline.
 */

import { config } from "dotenv";
import { getShoptetProducts } from "../src/features/pc-inventory/services/shoptet-xml-service";
import * as fs from "fs";
import * as path from "path";

// Load environment variables from .env.local
config({ path: ".env.local" });

const CACHE_DIR = path.join(process.cwd(), "data");
const CACHE_FILE = path.join(CACHE_DIR, "products-cache.json");

async function syncProducts() {
    console.log("🔄 Starting product sync from Shoptet XML...\n");

    try {
        // Fetch products from Shoptet XML
        console.log("📥 Fetching products from Shoptet XML feed...");
        const products = await getShoptetProducts();
        console.log(`✅ Fetched ${products.length} products from XML\n`);

        // Create data directory if it doesn't exist
        if (!fs.existsSync(CACHE_DIR)) {
            fs.mkdirSync(CACHE_DIR, { recursive: true });
            console.log("📁 Created data directory\n");
        }

        // Save to JSON file
        console.log("💾 Saving products to JSON cache...");
        const cacheData = {
            products,
            syncedAt: new Date().toISOString(),
            productCount: products.length,
            version: '1.0'
        };

        fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheData, null, 2));
        console.log(`✅ Successfully saved ${products.length} products to cache\n`);

        // Show cache file info
        const stats = fs.statSync(CACHE_FILE);
        const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2);

        console.log("📊 Cache Summary:");
        console.log(`  • File: ${CACHE_FILE}`);
        console.log(`  • Size: ${fileSizeMB} MB`);
        console.log(`  • Products: ${products.length}`);
        console.log(`  • Synced: ${new Date().toLocaleString()}`);
        console.log(`\n💡 Products are now stored persistently and will be available even when offline!`);
        console.log(`   API will automatically use cached data when Shoptet XML is unavailable.\n`);

    } catch (error) {
        console.error("❌ Error syncing products:", error);
        process.exit(1);
    }
}

// Run sync
syncProducts();
