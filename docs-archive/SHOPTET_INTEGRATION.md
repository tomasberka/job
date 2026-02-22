# 🛒 Shoptet XML Integration Guide

Complete guide to integrating real product data from your Shoptet e-shop (hellocomp.cz) into the HelloComp Marketing System.

---

## 📋 Overview

This integration replaces mock product data with **live product data** from your Shoptet e-shop via XML feed. Products are automatically fetched, parsed, and displayed in the PC Inventory module.

### What You Get
- ✅ Real-time product sync from hellocomp.cz
- ✅ Automatic product categorization (GAMER SE/Pro/Max)
- ✅ Stock status mapping (in-stock, low-stock, out-of-stock, pre-order)
- ✅ Automatic spec extraction (CPU, GPU, RAM, Storage, Cooling, PSU)
- ✅ Image URLs and availability status
- ✅ Smart tagging based on product names
- ✅ Fallback to mock data if XML fetch fails

---

## 🚀 Quick Start

### 1. Configure Shoptet XML Feed URL

Add to `.env.local`:

```bash
# Shoptet XML Feed URL (hellocomp.cz)
SHOPTET_XML_URL=https://hellocomp.cz/action/ExportProducts

# Optional: API token if your feed requires authentication
SHOPTET_API_TOKEN=your_token_here
```

**Common Shoptet XML URLs:**
- `https://hellocomp.cz/action/ExportProducts` — Standard export
- `https://hellocomp.cz/export/products.xml` — Custom export
- Get your feed URL from: **Shoptet Admin → Nastavení → Export produktů**

### 2. Enable Live Data

In `.env.local`, change:

```bash
# Set to false to use live Shoptet data
NEXT_PUBLIC_USE_MOCKS=false
```

### 3. Restart Dev Server

```bash
npm run dev
```

Navigate to `/pc-inventory` to see live products from hellocomp.cz!

---

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SHOPTET_XML_URL` | ✅ Yes | XML feed URL from Shoptet e-shop |
| `SHOPTET_API_TOKEN` | ❌ No | API token for authenticated feeds |
| `NEXT_PUBLIC_USE_MOCKS` | ✅ Yes | `false` = live data, `true` = mock data |

### Finding Your Shoptet XML URL

1. Log in to **Shoptet Admin** (admin.shoptet.cz)
2. Go to **Nastavení → Export produktů**
3. Enable **XML export** if not already enabled
4. Copy the provided XML feed URL
5. Common formats:
   - `https://[your-shop].cz/action/ExportProducts`
   - `https://[your-shop].cz/export/products.xml`

### Optional: API Authentication

If your XML feed requires authentication:

1. Go to **Shoptet Admin → Nastavení → API**
2. Generate API token
3. Add token to `.env.local`:

```bash
SHOPTET_API_TOKEN=your_generated_token_here
```

---

## 📊 Data Mapping

### How Shoptet Products Are Mapped

| Shoptet Field | PCProduct Field | Notes |
|---------------|-----------------|-------|
| `CODE` | `id`, `sku` | Product SKU |
| `PRODUCT` | `name` | Product name |
| `PRICE_VAT` | `price` | Price with VAT (CZK) |
| `IMGURL` | `imageUrl` | Main product image |
| `AVAILABILITY` | `status` | Mapped to in-stock/low-stock/out-of-stock/pre-order |
| `STOCK_QUANTITY` | `stock` | Numeric stock count |
| `CATEGORYTEXT` | `tags` | Added as tag |
| `PARAM` (CPU) | `specs.cpu` | CPU parameter |
| `PARAM` (GPU) | `specs.gpu` | GPU parameter |
| `PARAM` (RAM) | `specs.ram` | RAM parameter |
| `PARAM` (Storage) | `specs.storage` | Storage parameter |

### Lineup Detection

Products are automatically categorized into lineups based on product name:

- **GAMER SE** — Entry-level (default)
- **GAMER Pro** — Mid-range (if name contains "Pro")
- **GAMER Max** — High-end (if name contains "Max")

**Example:**
- `HelloComp GAMER SE - RTX 4060` → `GAMER SE`
- `HelloComp GAMER Pro - RTX 4070 Ti` → `GAMER Pro`
- `HelloComp GAMER Max - RTX 4090` → `GAMER Max`

### Status Mapping

| Shoptet Availability | PC Status | Condition |
|---------------------|-----------|-----------|
| "Skladem", "In stock" | `in-stock` | Stock > 3 |
| "Skladem", "In stock" | `low-stock` | Stock ≤ 3 |
| "Předobjednávka", "Pre-order" | `pre-order` | — |
| Any other | `out-of-stock` | — |

### Automatic Tagging

Tags are automatically generated from:
- **GPU mentions:** "RTX 4090" → `RTX 4090`
- **CPU mentions:** "Intel i7" → `Intel i7`, "Ryzen 7" → `Ryzen 7`
- **Category:** Shoptet `CATEGORYTEXT`
- **Availability:** Shoptet `AVAILABILITY` status

---

## 🧪 Testing

### 1. Test with Mock Data First

Keep `NEXT_PUBLIC_USE_MOCKS=true` initially:

```bash
npm run dev
```

Visit: `http://localhost:3000/pc-inventory`

✅ Verify mock products display correctly

### 2. Enable Live Shoptet Data

Update `.env.local`:

```bash
NEXT_PUBLIC_USE_MOCKS=false
SHOPTET_XML_URL=https://hellocomp.cz/action/ExportProducts
```

Restart server:

```bash
npm run dev
```

Visit: `http://localhost:3000/pc-inventory`

✅ Verify real products from hellocomp.cz appear

### 3. Check API Response

Visit: `http://localhost:3000/api/pc-inventory`

You should see JSON array with products from Shoptet.

### 4. Debugging

**If products don't appear:**

1. Check browser console for errors
2. Check server logs (`npm run dev` terminal)
3. Verify XML URL is correct: Open `SHOPTET_XML_URL` in browser
4. Verify XML format matches expected structure
5. Check fallback: System will use mock data if XML fetch fails

**Server logs will show:**
```
Shoptet XML fetch failed, falling back to mock data: [error]
```

---

## 🏗️ Project Structure

```
src/features/pc-inventory/
├── services/
│   ├── shoptet-xml-service.ts    // NEW: Shoptet XML fetcher & parser
│   ├── pc-inventory-service.ts   // Existing: Service layer
│   └── pc-inventory-mock.ts      // Existing: Mock data fallback
├── types/
│   └── pc-product.ts              // Existing: PCProduct schema
└── components/
    └── pc-product-card.tsx        // Existing: Product display

src/app/api/
└── pc-inventory/
    └── route.ts                   // UPDATED: Now uses Shoptet data
```

---

## 🔄 How It Works

### Request Flow

```
1. User visits /pc-inventory
2. React Query fetches /api/pc-inventory
3. API route checks NEXT_PUBLIC_USE_MOCKS
   ├─ true → Return mock data
   └─ false → Fetch Shoptet XML
       ├─ Success → Parse & return products
       └─ Fail → Fallback to mock data
4. Products displayed in grid
```

### XML Fetch & Parse

```typescript
// 1. Fetch XML from Shoptet
const xml = await fetch(SHOPTET_XML_URL)

// 2. Parse XML to JavaScript object
const parsed = XMLParser.parse(xml)

// 3. Filter only Gaming PCs
const gamingPCs = items.filter(isGamingPC)

// 4. Map to PCProduct schema
const products = gamingPCs.map(mapShoptetToPCProduct)

// 5. Return to client
return NextResponse.json(products)
```

### Caching

- XML fetch is cached for **5 minutes** (Next.js `revalidate: 300`)
- Reduces load on Shoptet server
- Improves performance
- To clear cache: Restart dev server

---

## 🎯 Product Filtering

### Only Gaming PCs Are Imported

The system automatically filters products to show **only gaming PCs**:

```typescript
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
```

**Matched products:**
- Category: "Gaming PC", "Herní počítače", "GAMER série"
- Name: "HelloComp GAMER Pro", "Gaming PC RTX 4090"

**Not matched:**
- Category: "Komponenty", "Příslušenství"
- Name: "Klávesnice", "Myš", "Monitor"

---

## 🔐 Security

### API Token Protection

- API tokens stored in **server-side** environment variables only
- Never exposed to client-side code
- XML fetching happens on server (API route)
- Tokens NOT included in client bundle

### HTTPS Required

- Always use `https://` URLs for production
- Shoptet provides HTTPS by default

---

## 🚨 Troubleshooting

### Common Issues

#### 1. "SHOPTET_XML_URL not configured"

**Cause:** Missing environment variable

**Fix:**
```bash
# Add to .env.local
SHOPTET_XML_URL=https://hellocomp.cz/action/ExportProducts
```

Restart server: `npm run dev`

#### 2. "Failed to fetch Shoptet XML: 401"

**Cause:** XML feed requires authentication

**Fix:**
```bash
# Add API token to .env.local
SHOPTET_API_TOKEN=your_token_here
```

Get token from: **Shoptet Admin → Nastavení → API**

#### 3. "Failed to fetch Shoptet XML: 404"

**Cause:** Incorrect XML URL

**Fix:**
- Verify URL in Shoptet admin
- Try alternative formats:
  - `https://hellocomp.cz/action/ExportProducts`
  - `https://hellocomp.cz/export/products.xml`

#### 4. No Products Displayed

**Causes:**
- Products not categorized as gaming PCs
- XML format doesn't match expected structure

**Fix:**
1. Open `SHOPTET_XML_URL` in browser
2. Check XML structure
3. Verify category names include "gaming", "herní", or "gamer"
4. Adjust filter in `isGamingPC()` function if needed

#### 5. Missing Product Specs

**Cause:** Shoptet XML doesn't include PARAM fields

**Fix:**
1. Go to **Shoptet Admin → Produkty**
2. Edit product → **Parametry**
3. Add parameters:
   - **CPU** or **Procesor**
   - **GPU** or **Grafická karta**
   - **RAM** or **Paměť**
   - **Storage** or **Úložiště**
4. Re-export XML

---

## 📈 Performance

### Optimization Features

- ✅ **XML caching:** 5-minute cache (Next.js `revalidate`)
- ✅ **Fallback to mock:** No downtime if Shoptet is unreachable
- ✅ **Efficient parsing:** fast-xml-parser library
- ✅ **Filtered products:** Only gaming PCs processed
- ✅ **Type safety:** Full TypeScript validation with Zod

### Expected Load Times

- **First request:** 500-1500ms (fetches & parses XML)
- **Cached requests:** 10-50ms (served from cache)
- **Mock fallback:** <10ms (local data)

---

## 🎓 Next Steps

### 1. Enable Live Data

```bash
# .env.local
NEXT_PUBLIC_USE_MOCKS=false
SHOPTET_XML_URL=https://hellocomp.cz/action/ExportProducts
```

### 2. Test Integration

```bash
npm run dev
```

Visit: `http://localhost:3000/pc-inventory`

### 3. Deploy to Production

```bash
# Add to production environment variables (Vercel, etc.)
SHOPTET_XML_URL=https://hellocomp.cz/action/ExportProducts
SHOPTET_API_TOKEN=your_token_here
NEXT_PUBLIC_USE_MOCKS=false

# Deploy
npm run build
npm start
```

### 4. Monitor Performance

- Check server logs for XML fetch errors
- Monitor Shoptet API usage limits
- Adjust cache duration if needed (`revalidate: 300`)

---

## 📚 Resources

- **Shoptet XML Export Docs:** https://napoveda.shoptet.cz/xml-exporty/
- **Shoptet API Docs:** https://napoveda.shoptet.cz/api/
- **fast-xml-parser:** https://github.com/NaturalIntelligence/fast-xml-parser

---

## ✅ Summary

You now have:
- ✅ Real-time product sync from hellocomp.cz Shoptet e-shop
- ✅ Automatic product categorization and spec extraction
- ✅ Robust error handling with mock data fallback
- ✅ 5-minute caching for optimal performance
- ✅ Type-safe data validation with Zod schemas

**Your marketing system is now connected to live product data!** 🎉
