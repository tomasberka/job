/**
 * Shoptet XML Feed Integration
 * Fetches and parses product data from Shoptet e-shop XML feed
 * @see https://napoveda.shoptet.cz/xml-exporty/
 */

import { XMLParser } from "fast-xml-parser";
import type { PCProduct, PCLineup, PCStatus } from "../types/pc-product";

// Shoptet XML structure (simplified)
interface ShoptetProduct {
    PRODUCT: string;
    CODE: string;
    PRICE_VAT: number;
    DESCRIPTION?: string;
    DESCRIPTION_SHORT?: string;
    IMGURL?: string;
    AVAILABILITY?: string;
    CATEGORYTEXT?: string;
    MANUFACTURER?: string;
    PARAM?: ShoptetParam | ShoptetParam[];
    STOCK_QUANTITY?: number;
}

interface ShoptetParam {
    PARAM_NAME: string;
    VAL: string;
}

interface ShoptetXMLRoot {
    SHOP: {
        SHOPITEM: ShoptetProduct | ShoptetProduct[];
    };
}

/**
 * Fetch XML feed from Shoptet e-shop
 */
export async function fetchShoptetXML(): Promise<string> {
    const xmlUrl = process.env.SHOPTET_XML_URL;

    if (!xmlUrl) {
        throw new Error("SHOPTET_XML_URL not configured in environment variables");
    }

    const headers: HeadersInit = {
        "User-Agent": "HelloComp-Marketing-Hub/1.0",
    };

    // Add authentication if token is provided
    const apiToken = process.env.SHOPTET_API_TOKEN;
    if (apiToken) {
        headers["Authorization"] = `Bearer ${apiToken}`;
    }

    const response = await fetch(xmlUrl, {
        headers,
        next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
        throw new Error(
            `Failed to fetch Shoptet XML: ${response.status} ${response.statusText}`
        );
    }

    return response.text();
}

/**
 * Parse Shoptet XML to PCProduct array
 */
export async function parseShoptetXML(xmlString: string): Promise<PCProduct[]> {
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
        textNodeName: "#text",
        parseTagValue: true,
        trimValues: true,
    });

    const parsed = parser.parse(xmlString) as ShoptetXMLRoot;

    // Handle single product or array
    const items = Array.isArray(parsed.SHOP.SHOPITEM)
        ? parsed.SHOP.SHOPITEM
        : [parsed.SHOP.SHOPITEM];

    return items
        .filter((item) => isGamingPC(item)) // Only gaming PCs
        .map(mapShoptetToPCProduct);
}

/**
 * Check if product is a gaming PC (based on category or name)
 */
function isGamingPC(item: ShoptetProduct): boolean {
    const category = item.CATEGORYTEXT?.toLowerCase() || "";
    const name = item.PRODUCT?.toLowerCase() || "";

    return (
        category.includes("gaming") ||
        category.includes("herní") ||
        category.includes("gamer") ||
        name.includes("gamer") ||
        name.includes("gaming pc")
    );
}

/**
 * Map Shoptet product to PCProduct schema
 */
function mapShoptetToPCProduct(item: ShoptetProduct): PCProduct {
    const params = extractParams(item.PARAM);
    const lineup = extractLineup(item.PRODUCT);
    const status = mapAvailabilityToStatus(item.AVAILABILITY, item.STOCK_QUANTITY);

    return {
        id: item.CODE,
        sku: item.CODE,
        name: item.PRODUCT,
        lineup,
        price: Math.round(item.PRICE_VAT), // Convert to integer
        currency: "CZK" as const,
        specs: {
            cpu: params.CPU || params.Procesor || "N/A",
            gpu: params.GPU || params["Grafická karta"] || "N/A",
            ram: params.RAM || params.Paměť || "N/A",
            storage: params.Storage || params.Úložiště || params.Disk || "N/A",
            cooling: params.Cooling || params.Chlazení || "Standard",
            psu: params.PSU || params.Zdroj || "Standard",
        },
        status,
        stock: item.STOCK_QUANTITY || 0,
        imageUrl: item.IMGURL,
        tags: extractTags(item),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
}

/**
 * Extract parameters from Shoptet PARAM structure
 */
function extractParams(param?: ShoptetParam | ShoptetParam[]): Record<string, string> {
    if (!param) return {};

    const params = Array.isArray(param) ? param : [param];
    const result: Record<string, string> = {};

    for (const p of params) {
        if (p.PARAM_NAME && p.VAL) {
            result[p.PARAM_NAME] = p.VAL;
        }
    }

    return result;
}

/**
 * Extract lineup from product name
 */
function extractLineup(productName: string): PCLineup {
    const name = productName.toLowerCase();

    if (name.includes("max")) return "GAMER Max";
    if (name.includes("pro")) return "GAMER Pro";
    return "GAMER SE"; // Default to entry-level
}

/**
 * Map Shoptet availability to PCStatus
 */
function mapAvailabilityToStatus(
    availability?: string,
    stock?: number
): PCStatus {
    if (!availability) return "out-of-stock";

    const avail = availability.toLowerCase();

    if (avail.includes("předobjednávka") || avail.includes("pre-order")) {
        return "pre-order";
    }

    if (avail.includes("skladem") || avail.includes("in stock")) {
        if (stock !== undefined && stock < 3) {
            return "low-stock";
        }
        return "in-stock";
    }

    return "out-of-stock";
}

/**
 * Extract tags from product data
 */
function extractTags(item: ShoptetProduct): string[] {
    const tags: string[] = [];
    const name = item.PRODUCT.toLowerCase();

    // Add GPU tags
    if (name.includes("rtx")) {
        const rtxMatch = name.match(/rtx\s*(\d{4})/i);
        if (rtxMatch) tags.push(`RTX ${rtxMatch[1]}`);
    }

    // Add CPU tags
    if (name.includes("i5")) tags.push("Intel i5");
    if (name.includes("i7")) tags.push("Intel i7");
    if (name.includes("i9")) tags.push("Intel i9");
    if (name.includes("ryzen 5")) tags.push("Ryzen 5");
    if (name.includes("ryzen 7")) tags.push("Ryzen 7");
    if (name.includes("ryzen 9")) tags.push("Ryzen 9");

    // Add category tag
    if (item.CATEGORYTEXT) {
        tags.push(item.CATEGORYTEXT);
    }

    // Add availability tag
    if (item.AVAILABILITY) {
        tags.push(item.AVAILABILITY);
    }

    return tags;
}

/**
 * Main function: Fetch and parse Shoptet products
 */
export async function getShoptetProducts(): Promise<PCProduct[]> {
    try {
        const xml = await fetchShoptetXML();
        return await parseShoptetXML(xml);
    } catch (error) {
        console.error("Failed to fetch Shoptet products:", error);
        throw error;
    }
}
