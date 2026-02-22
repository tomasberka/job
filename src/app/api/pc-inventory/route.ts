import { NextResponse } from "next/server";
import { PC_INVENTORY_MOCK } from "@/features/pc-inventory/services/pc-inventory-mock";
import { getShoptetProducts } from "@/features/pc-inventory/services/shoptet-xml-service";

export async function GET() {
  // Check if we should use real Shoptet data
  const useShoptet = process.env.SHOPTET_XML_URL && process.env.NEXT_PUBLIC_USE_MOCKS !== "true";

  if (useShoptet) {
    try {
      const products = await getShoptetProducts();
      return NextResponse.json(products);
    } catch (error) {
      console.error("Shoptet XML fetch failed, falling back to mock data:", error);
      // Fall back to mock data if Shoptet fails
      return NextResponse.json(PC_INVENTORY_MOCK);
    }
  }

  // Use mock data by default
  return NextResponse.json(PC_INVENTORY_MOCK);
}
