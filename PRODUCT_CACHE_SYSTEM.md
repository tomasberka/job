# Product Cache System

## Executive Summary

HelloComp now runs on a stable data pipeline:

- Source: Shoptet XML feed
- Cache: `data/products-cache.json`
- API: `/api/pc-inventory`
- Fallbacks: live XML, then mock

This removed repeated heavy XML parsing from user requests and made product data fast and reliable for content production.

## Why This Matters

Without cache, every request depends on a large external XML feed. With cache, the dashboard behaves like a product database:

- Fast responses for UI and content tools
- Better reliability when external feed is slow/unavailable
- Lower operational risk for daily marketing execution
- Ready foundation for banner and social creative automation

## Current Data Flow

1. Run `npm run sync-products`
2. Fetch products from Shoptet XML
3. Write normalized JSON cache
4. API returns cached products first
5. If cache is missing, API attempts live XML
6. If live fetch fails, API returns mock fallback

## Operational Commands

```bash
# Refresh local cache
npm run sync-products

# Start dashboard
npm run dev

# Verify API source
curl -I http://localhost:3000/api/pc-inventory
```

Expected headers include:

- `X-Data-Source: cache | live-xml | mock`
- `X-Product-Count`
- `X-Cache-Age` (when cache is used)

## Key Files

- `scripts/sync-products-cache.ts`
- `data/products-cache.json`
- `src/features/pc-inventory/services/product-cache-service.ts`
- `src/features/pc-inventory/services/shoptet-xml-service.ts`
- `src/app/api/pc-inventory/route.ts`

## Recommended Routine

- Run sync once daily (or before major campaigns)
- Keep cache under version control policy you prefer (committed via automation, or generated on host)
- Monitor product count and cache age from API headers

## What This Enables Next

The cache system is the base layer for a Visual Content Factory:

- read product fields once,
- map to reusable banner templates,
- export many creative variants quickly.

See [VISUAL_CONTENT_FACTORY_PLAN.md](VISUAL_CONTENT_FACTORY_PLAN.md) for the implementation plan.
