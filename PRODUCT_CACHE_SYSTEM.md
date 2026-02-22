# Product Cache System 🚀

## Overview

**Problem Solved**: The 76MB Shoptet XML feed was being fetched and parsed on every API request, causing:
- Slow response times (5-10 seconds per request)
- High bandwidth usage
- No offline capability
- MacBook-dependent operation

**Solution**: Smart caching system that stores all 801 products locally in a fast 1.15 MB JSON file.

## How It Works

```
┌─────────────────────────────────────────────────┐
│          API Request (/api/pc-inventory)        │
└───────────────┬─────────────────────────────────┘
                │
                ▼
       ┌────────────────────┐
       │  1. Check Cache    │  ← FAST (38ms)
       │  data/products-    │
       │  cache.json        │
       └────────┬───────────┘
                │
         ┌──────┴──────┐
         │ Cache Valid? │
         └──────┬───────┘
                │
       ┌────────┴────────┐
       │ YES              │ NO
       ▼                  ▼
  ┌─────────┐      ┌──────────────┐
  │ Return  │      │ 2. Try Live  │
  │ Cache   │      │ Shoptet XML  │
  │ (801    │      │ (76MB fetch) │
  │ products)│     └──────┬────────┘
  └─────────┘             │
                    ┌─────┴──────┐
                    │ XML Works? │
                    └─────┬──────┘
                          │
                  ┌───────┴───────┐
                  │ YES           │ NO
                  ▼               ▼
           ┌──────────┐    ┌──────────┐
           │ Return   │    │ 3. Mock  │
           │ XML Data │    │ Fallback │
           └──────────┘    └──────────┘
```

## Performance

### Before (Direct XML):
- **Response Time**: 5-10 seconds
- **Bandwidth**: 76 MB per request
- **Caching**: Next.js fails (>2MB limit)
- **Offline**: ❌ No

### After (JSON Cache):
- **Response Time**: ~38ms (130x faster!)
- **Bandwidth**: 1.15 MB once, then 0
- **Caching**: ✅ File system
- **Offline**: ✅ Yes

## Usage

### 1. Sync Products (Run Once Daily)

```bash
npm run sync-products
```

**What it does:**
- Fetches all 801 products from Shoptet XML
- Saves to `data/products-cache.json`
- Takes ~10 seconds
- Should be run daily (or when products change)

**Output:**
```
🔄 Starting product sync from Shoptet XML...
📥 Fetching products from Shoptet XML feed...
✅ Fetched 801 products from XML
💾 Saving products to JSON cache...
✅ Successfully saved 801 products to cache

📊 Cache Summary:
  • File: /Users/llo/Documents/GitHub/job/data/products-cache.json
  • Size: 1.15 MB
  • Products: 801
  • Synced: 2/22/2026, 12:59:23 PM
```

### 2. API Automatically Uses Cache

```bash
curl http://localhost:3000/api/pc-inventory
```

**Response Headers:**
```
x-data-source: cache        ← Using cached data
x-cache-age: 1m             ← Cache is 1 minute old
x-product-count: 801        ← All products loaded
```

## Cache Validation

Cache is considered **valid** for 24 hours. After that:
- API will attempt live XML fetch
- If XML fails, old cache still works
- Just run `npm run sync-products` to refresh

## Deployment Strategy

### Development (Local MacBook)
```bash
# Sync once
npm run sync-products

# Start dev server (uses cache)
npm run dev
```

### Production (Server/Vercel)
Two options:

#### Option 1: Pre-deploy Sync
```bash
# On your MacBook before deploy:
npm run sync-products
git add data/products-cache.json  # One-time exception
git commit -m "Update product cache"
git push

# Or add to build step:
# package.json
"scripts": {
  "build": "npm run sync-products && next build"
}
```

#### Option 2: Scheduled Sync (Recommended)
Set up cron job or GitHub Actions to run daily:

```yaml
# .github/workflows/sync-products.yml
name: Sync Products Daily
on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM daily
  workflow_dispatch:
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run sync-products
      - run: |
          git config user.name "Bot"
          git config user.email "bot@example.com"
          git add data/products-cache.json
          git commit -m "chore: Update product cache [skip ci]"
          git push
```

## API Data Source Priority

1. **Cache First** (default)
   - Fast, reliable, works offline
   - Used if cache exists and < 24h old

2. **Live XML** (fallback)
   - If cache missing or invalid
   - Slow but always fresh

3. **Mock Data** (last resort)
   - If both cache and XML fail
   - 4 sample products

## Files

```
project/
├── data/
│   └── products-cache.json          # 801 products, 1.15 MB
├── scripts/
│   └── sync-products-cache.ts       # Sync script
├── src/
│   ├── app/api/pc-inventory/
│   │   └── route.ts                 # API with cache logic
│   └── features/pc-inventory/
│       └── services/
│           ├── product-cache-service.ts     # Cache utilities
│           └── shoptet-xml-service.ts       # Live XML fetcher
├── package.json
│   └── "sync-products": "tsx scripts/sync-products-cache.ts"
└── .gitignore
    └── data/                        # Cache not committed
```

## Benefits

### ✅ Speed
- 130x faster API responses (5s → 38ms)
- Instant page loads
- Better user experience

### ✅ Reliability
- Works offline
- No dependency on Shoptet uptime
- Graceful degradation

### ✅ Cost Efficiency
- Reduced bandwidth
- Lower server load
- Fewer API calls

### ✅ Deployment Freedom
- MacBook can be off
- Server independent
- Cache committed to repo or synced via CI/CD

### ✅ Marketing Ready
- All 801 products always available
- Multiple images per product
- Promotional flags
- Complete specs for graphics/ads

## Maintenance

### Daily Sync (Recommended)
```bash
# Add to crontab
0 8 * * * cd /path/to/job && npm run sync-products
```

### Manual Sync
```bash
npm run sync-products
```

### Check Cache Status
```bash
# Via API headers
curl -I http://localhost:3000/api/pc-inventory

# Or check file
ls -lh data/products-cache.json
cat data/products-cache.json | jq '.syncedAt, .productCount'
```

### Force Fresh Data
```bash
# Delete cache to force live XML fetch
rm data/products-cache.json

# Or just re-sync
npm run sync-products
```

## Troubleshooting

### Cache not found
```
⚠️  Cache file not found. Run: npm run sync-products
```
**Solution**: `npm run sync-products`

### Old cache warning
```
📦 Using cached products (801 items, age: 25h)
```
**Solution**: Cache still works but consider running `npm run sync-products`

### Sync fails
```
❌ Error syncing products: Error: SHOPTET_XML_URL not configured
```
**Solution**: Check `.env.local` has `SHOPTET_XML_URL` set

## Future Enhancements

- [ ] Automatic background sync every 24h
- [ ] Cache diff reporting (what changed)
- [ ] Multi-cache support (staging/production)
- [ ] Cache compression (gzip)
- [ ] Webhook-triggered sync (when Shoptet updates)

---

**Result**: Your "one man marketing boss" system now has persistent, fast, offline-capable access to all 801 products with complete data! 🎉
