/**
 * Product Cache Service
 * =====================
 * 
 * Handles reading products from JSON cache with fallback to live XML fetch.
 */

import * as fs from "fs";
import * as path from "path";
import { PCProduct } from "../types/pc-product";

const CACHE_FILE = path.join(process.cwd(), "data", "products-cache.json");
const CACHE_MAX_AGE_HOURS = 24; // Re-sync if cache is older than 24 hours

interface CacheData {
    products: PCProduct[];
    syncedAt: string;
    productCount: number;
    version: string;
}

/**
 * Check if cache file exists and is recent
 */
export function isCacheValid(): boolean {
    if (!fs.existsSync(CACHE_FILE)) {
        return false;
    }

    const stats = fs.statSync(CACHE_FILE);
    const ageHours = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60);

    return ageHours < CACHE_MAX_AGE_HOURS;
}

/**
 * Read products from cache file
 */
export function getProductsFromCache(): PCProduct[] {
    try {
        if (!fs.existsSync(CACHE_FILE)) {
            console.log("⚠️  Cache file not found. Run: npm run sync-products");
            return [];
        }

        const data = fs.readFileSync(CACHE_FILE, "utf-8");
        const cacheData: CacheData = JSON.parse(data);

        console.log(`✅ Loaded ${cacheData.productCount} products from cache (synced: ${new Date(cacheData.syncedAt).toLocaleString()})`);

        return cacheData.products;
    } catch (error) {
        console.error("❌ Error reading cache:", error);
        return [];
    }
}

/**
 * Get cache info
 */
export function getCacheInfo(): { exists: boolean; valid: boolean; age?: string; count?: number } {
    if (!fs.existsSync(CACHE_FILE)) {
        return { exists: false, valid: false };
    }

    const stats = fs.statSync(CACHE_FILE);
    const ageMs = Date.now() - stats.mtimeMs;
    const ageHours = Math.floor(ageMs / (1000 * 60 * 60));
    const ageMinutes = Math.floor((ageMs % (1000 * 60 * 60)) / (1000 * 60));

    const data = fs.readFileSync(CACHE_FILE, "utf-8");
    const cacheData: CacheData = JSON.parse(data);

    return {
        exists: true,
        valid: ageHours < CACHE_MAX_AGE_HOURS,
        age: ageHours > 0 ? `${ageHours}h ${ageMinutes}m` : `${ageMinutes}m`,
        count: cacheData.productCount
    };
}
