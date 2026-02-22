/**
 * Shoptet XML Feed Integration
 * Fetches and parses product data from Shoptet e-shop XML feed
 * @see https://napoveda.shoptet.cz/xml-exporty/
 */

import { XMLParser } from "fast-xml-parser";
import type { PCProduct, PCLineup, PCStatus } from "../types/pc-product";

// Shoptet XML structure (actual hellocomp.cz format)
interface ShoptetProduct {
    "@_id": string;
    NAME: string;
    PRICE_VAT: number;
    DESCRIPTION?: string;
    SHORT_DESCRIPTION?: string;
    IMAGES?: {
        IMAGE: ShoptetImage | ShoptetImage[];
    };
    AVAILABILITY_IN_STOCK?: string;
    AVAILABILITY_OUT_OF_STOCK?: string;
    CATEGORIES?: {
        CATEGORY: string | string[];
        DEFAULT_CATEGORY?: string;
    };
    MANUFACTURER?: string;
    STOCK?: string | number;
    FLAGS?: {
        FLAG: ShoptetFlag | ShoptetFlag[];
    };
    WARRANTY?: string;
}

interface ShoptetImage {
    "#text": string;
    "@_description"?: string;
}

interface ShoptetFlag {
    CODE: string;
    ACTIVE: string | number;
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
        next: { revalidate: 30000 }, // Cache
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
    const name = item.NAME?.toLowerCase() || "";

    // Exclude accessories explicitly
    if (name.includes("monitor") || name.includes("chair") || name.includes("myš") ||
        name.includes("klávesnice") || name.includes("headset") || name.includes("sluchátka") ||
        name.includes("mousepad") || name.includes("podložka") || name.includes("reproduktor") ||
        name.includes("mikrofon") || name.includes("kabel")) {
        return false;
    }

    // Must have CPU/GPU indicators (actual PC)
    const hasPCIndicator = /\b(i[3579][\- ]|ryzen\s*[3579]|r[3579][\- ]|gtx\s*\d|rtx\s*\d|rx\s*\d)/i.test(name);
    if (hasPCIndicator) return true;

    // Or has GAMER/Gaming in name AND has GB (RAM/storage indicator)
    const hasGamingKeyword = name.includes("gamer") && /\d+gb/i.test(name);

    return hasGamingKeyword;
}

/**
 * Map Shoptet product to PCProduct schema
 */
function mapShoptetToPCProduct(item: ShoptetProduct): PCProduct {
    const specs = extractSpecsFromDescription(item.DESCRIPTION || "");
    const lineup = extractLineup(item.NAME);
    const status = mapAvailabilityToStatus(item.AVAILABILITY_IN_STOCK, item.STOCK);
    const images = extractImages(item.IMAGES);
    const flags = extractFlags(item.FLAGS);

    return {
        id: item["@_id"],
        sku: item["@_id"],
        name: item.NAME,
        lineup,
        price: Math.round(item.PRICE_VAT),
        currency: "CZK" as const,
        specs,
        status,
        stock: typeof item.STOCK === "number" ? item.STOCK : 0,
        imageUrl: images[0], // Primary image
        images, // ALL images for marketing/ads
        flags, // Promo flags (action, new, tip)
        shortDescription: stripHTML(item.SHORT_DESCRIPTION),
        tags: extractTags(item),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
}

/**
 * Strip HTML tags from text
 */
function stripHTML(html?: string): string | undefined {
    if (!html) return undefined;
    return html.replace(/<[^>]*>/g, '').replace(/<!\[CDATA\[|\]\]>/g, '').trim();
}

/**
 * Extract specs from HTML description
 */
function extractSpecsFromDescription(description: string): {
    cpu: string;
    gpu: string;
    ram: string;
    storage: string;
    cooling: string;
    psu: string;
} {
    const specs = {
        cpu: "N/A",
        gpu: "N/A",
        ram: "N/A",
        storage: "N/A",
        cooling: "Standard",
        psu: "Standard",
    };

    // Extract CPU
    const cpuMatch = description.match(/<div class="konfigurace-specs">([^<]*(?:Ryzen|Intel|i[3579])[^<]*)<\/div>/i);
    if (cpuMatch) specs.cpu = cpuMatch[1].trim();

    // Extract GPU
    const gpuMatch = description.match(/GPU:<\/span>\s*<div class="konfigurace-specs">([^<]+)<\/div>/i);
    if (gpuMatch) specs.gpu = gpuMatch[1].trim();

    // Extract RAM
    const ramMatch = description.match(/RAM:<\/span>\s*<div class="konfigurace-specs">([^<]+)<\/div>/i);
    if (ramMatch) specs.ram = ramMatch[1].trim();

    // Extract Storage (SSD + HDD)
    const storageMatch = description.match(/SSD \+ HDD:<\/span>\s*<div class="konfigurace-specs">([^<]+)<\/div>/i);
    if (storageMatch) {
        specs.storage = storageMatch[1].trim();
    } else {
        // Try just SSD
        const ssdMatch = description.match(/SSD:<\/span>\s*<div class="konfigurace-specs">([^<]+)<\/div>/i);
        if (ssdMatch) specs.storage = ssdMatch[1].trim();
    }

    // Extract Cooling
    const coolingMatch = description.match(/chladič:<\/span>\s*<div class="konfigurace-specs">([^<]+)<\/div>/i);
    if (coolingMatch) specs.cooling = coolingMatch[1].trim();

    // Extract PSU
    const psuMatch = description.match(/Zdroj:<\/span>\s*<div class="konfigurace-specs">([^<]+)<\/div>/i);
    if (psuMatch) specs.psu = psuMatch[1].trim();

    return specs;
}

/**
 * Extract all images from IMAGES structure
 */
function extractImages(images?: { IMAGE: ShoptetImage | ShoptetImage[] }): string[] {
    if (!images) return [];

    const imageList = Array.isArray(images.IMAGE) ? images.IMAGE : [images.IMAGE];
    return imageList.map(img => {
        if (typeof img === 'string') return img;
        return img["#text"];
    }).filter(Boolean);
}

/**
 * Extract promotional flags (action, new, tip)
 */
function extractFlags(flagsObj?: { FLAG: ShoptetFlag | ShoptetFlag[] }): string[] {
    if (!flagsObj) return [];

    const flags = Array.isArray(flagsObj.FLAG) ? flagsObj.FLAG : [flagsObj.FLAG];
    return flags
        .filter(f => f.ACTIVE === 1 || f.ACTIVE === "1")
        .map(f => f.CODE);
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
    stock?: string | number
): PCStatus {
    if (!availability) return "out-of-stock";

    const avail = availability.toLowerCase();
    const stockNum = typeof stock === "number" ? stock : 0;

    if (avail.includes("předobjednávka") || avail.includes("pre-order")) {
        return "pre-order";
    }

    if (avail.includes("skladem") || avail.includes("in stock")) {
        if (stockNum > 0 && stockNum < 3) {
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
    const name = item.NAME.toLowerCase();

    // Add GPU tags
    if (name.includes("rtx")) {
        const rtxMatch = name.match(/rtx\s*(\d{4})/i);
        if (rtxMatch) tags.push(`RTX ${rtxMatch[1]}`);
    }
    if (name.includes("rx ")) {
        const rxMatch = name.match(/rx\s*(\d{4})/i);
        if (rxMatch) tags.push(`RX ${rxMatch[1]}`);
    }
    if (name.includes("gtx")) {
        const gtxMatch = name.match(/gtx\s*(\d{4})/i);
        if (gtxMatch) tags.push(`GTX ${gtxMatch[1]}`);
    }

    // Add CPU tags
    if (name.includes("i5")) tags.push("Intel i5");
    if (name.includes("i7")) tags.push("Intel i7");
    if (name.includes("i9")) tags.push("Intel i9");
    if (name.includes("ryzen 5") || name.includes("r5 ")) tags.push("Ryzen 5");
    if (name.includes("ryzen 7") || name.includes("r7 ")) tags.push("Ryzen 7");
    if (name.includes("ryzen 9") || name.includes("r9 ")) tags.push("Ryzen 9");

    // Add category tag
    const categories = item.CATEGORIES?.CATEGORY;
    if (categories) {
        const categoryText = Array.isArray(categories) ? categories[0] : categories;
        tags.push(categoryText);
    }

    // Add availability tag
    if (item.AVAILABILITY_IN_STOCK) {
        tags.push(item.AVAILABILITY_IN_STOCK);
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
