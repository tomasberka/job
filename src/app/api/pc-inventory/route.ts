import { NextResponse } from "next/server";
import { PC_INVENTORY_MOCK } from "@/features/pc-inventory/services/pc-inventory-mock";
import { getShoptetProducts } from "@/features/pc-inventory/services/shoptet-xml-service";
import { getProductsFromCache, getCacheInfo } from "@/features/pc-inventory/services/product-cache-service";

export async function GET() {
  // Strategy: Cache First, then Live XML, then Mock
  // This ensures fast responses and offline capability

  // 1. Check if cache exists and is valid
  const cacheInfo = getCacheInfo();

  if (cacheInfo.exists) {
    console.log(`📦 Using cached products (${cacheInfo.count} items, age: ${cacheInfo.age})`);
    const products = getProductsFromCache();

    if (products.length > 0) {
      return NextResponse.json(products, {
        headers: {
          'X-Data-Source': 'cache',
          'X-Cache-Age': cacheInfo.age || 'unknown',
          'X-Product-Count': String(cacheInfo.count || 0),
        }
      });
    }
  }

  // 2. Try live Shoptet XML if cache unavailable
  const useShoptet = process.env.SHOPTET_XML_URL && process.env.NEXT_PUBLIC_USE_MOCKS !== "true";

  if (useShoptet) {
    try {
      console.log("📡 Fetching live data from Shoptet XML (cache unavailable)...");
      const products = await getShoptetProducts();
      return NextResponse.json(products, {
        headers: {
          'X-Data-Source': 'live-xml',
          'X-Product-Count': String(products.length),
        }
      });
    } catch (error) {
      console.error("❌ Shoptet XML fetch failed:", error);
      // Fall through to mock data
    }
  }

  // 3. Fall back to mock data
  console.log("🎭 Using mock data (cache and live fetch unavailable)");
  return NextResponse.json(PC_INVENTORY_MOCK, {
    headers: {
      'X-Data-Source': 'mock'
    }
  });
}
