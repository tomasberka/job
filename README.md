# HelloComp — Řídicí panel + Visual Content Factory

Internal Next.js dashboard **and** standalone visual content tooling for [HelloComp](https://hellocomp.cz) — a Czech gaming PC brand. Manages product stock, SEO/copywriting, social media production, feed distribution, visual post generation, and brand governance in one repo.

---

## Features

| Module | Route | Description |
|---|---|---|
| **PC Inventory** | `/` · `/pc-inventory` | Gaming PC stock overview — GAMER SE, Pro, Max lineups with live status and specs. Shoptet XML integration for real hellocomp.cz product data |
| **Content Generator** | `/content-generator` | TikTok hooks, SEO metadata, video scripts per product SKU |
| **Trending Social Posts** | `/social-posts` | AI-powered social media posts with trend awareness (TikTok, Instagram, Twitter, LinkedIn, YouTube Shorts) |
| **Photo Post Generator** | `/photo-generator.html` | **v3.0** — 5 premium 9:16 photo-card templates with Adobe Express SDK, smart copy engine, auto BG removal, HelloComp logo watermark |
| **RSS Feed** | `/feed.xml` | Product RSS feed for hellocomp.cz (media:content, atom:link) |
| **Sitemap** | `/sitemap.xml` | Next.js sitemap with per-page priorities and product images |

---

## Visual Content Factory (v3.0)

Standalone photo-post generator at **`/photo-generator.html`** — powered by Adobe Express Embed SDK v4. Load 52 curated gaming PCs from CSV → generate branded 9:16 social cards instantly.

### 5 Templates

| Template | Style | Background |
|----------|-------|------------|
| **Hero** | Dark cinematic | Gradient `#0f1628 → #04070d`, product top 52%, gradient overlay text |
| **Split** | Clean editorial | Light `#f5f7fa`, product top half, white content panel, spec-tag pills |
| **Minimal** | Modern simple | White → `#f0f2f6`, product 55%, subtle claim + hook |
| **Neon** | Gaming glow | Dark radial gradient, cyan/purple glow-ring, floating product |
| **Specs** | Tech spec-sheet | Dark `#111827`, product 38%, emoji-icon spec rows (⚡🎮💾) |

All templates use `object-fit: contain` (product zoomed out, clean display) + HelloComp SVG logo watermark.

### Key Features

- **Adobe Express Embed SDK** — Quick Actions (remove BG, resize, effects) via client ID `6742aefa92e546b5a3f0031f7168bbde`
- **Auto Background Removal** — Checked by default; runs `removeBackgroundAll()` on all loaded images after SDK init
- **Smart Copy Engine** — Price-tier-based Czech marketing copy (budget < 17k / mid 17–30k / premium 30–50k / ultra 50k+). Unique hook/claim/CTA selection with `pickUnique()` — no duplicates across batch. 10 hooks per tier, 4 claims per tier, 8 CTAs
- **HelloComp Logo** — SVG logo rendered via `logoHtml(dark)` with conditional invert filter for dark/light backgrounds
- **CSV-driven** — Paste or load `products-all.csv` (52 products: name, price, CPU, GPU, RAM, image URL)

### Files

| File | Purpose |
|------|---------|
| `tools/visual-post-factory/photo-post-generator.html` | Source (578 lines, v3.0) |
| `public/photo-generator.html` | Served copy (synced) |
| `public/hellocomp_logo_website.svg` | HelloComp SVG logo (72 KB) |
| `public/products-all.csv` | 52 curated gaming PCs |

---

## One-Man Marketing Flow

Default dashboard route (`/`) is a unified **Marketing Command Center** for solo execution:

**Features:**
- **System Status Dashboard** — Real-time build, security & dependency health
- **Interactive Daily Checklist** — Track your 60-90 min workflow with progress
- **Focus Timer** — Built-in timer for time-boxing your marketing sessions
- **Trending Topics Preview** — See top gaming PC trends at a glance
- **Quick Documentation Links** — Instant access to system guides
- **Quick Actions** — One-click access to all modules

**Workflow:**
1. **PC Inventory** (`/pc-inventory`) → source product truth (SKU/spec/price/stock)
2. **Content Generator** (`/content-generator`) → SEO copy + hooks + scripts
3. **Social Posts** (`/social-posts`) → trend-based posts per platform and tone
4. **Photo Factory** (`/photo-generator.html`) → branded visual cards via Adobe Express
5. **Feed/Sitemap** (`/feed.xml`, `/sitemap.xml`) → discoverability and syndication

---

## Tech Stack

- **Framework** — [Next.js 16](https://nextjs.org) (App Router, React 19)
- **Language** — TypeScript 5
- **Styling** — Tailwind CSS 3 + `class-variance-authority`
- **UI components** — Radix UI (Dialog, DropdownMenu, Tooltip, Separator, Slot)
- **Data fetching** — TanStack React Query 5
- **Animations** — Framer Motion 11
- **Icons** — Lucide React
- **Validation** — Zod 3
- **Linting** — ESLint (Next.js config)
- **Visual tooling** — Adobe Express Embed SDK v4 (client-side, `localhost:3000`)
- **Content automation** — Python CLI (`tools/content-automation/`) — hooks, SEO, omnichannel

---

## Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout — Sidebar + QueryProvider wrapper
│   ├── page.tsx                # Dashboard home → renders PCInventoryRoute
│   ├── globals.css             # Global styles
│   ├── sitemap.ts              # /sitemap.xml — Next.js MetadataRoute
│   ├── feed.xml/route.ts       # /feed.xml — RSS 2.0 product feed
│   ├── pc-inventory/page.tsx   # /pc-inventory page
│   ├── content-generator/page.tsx
│   ├── social-posts/page.tsx
│   └── api/                    # API routes (content-items, pc-inventory, social-posts)
│
├── components/
│   ├── sidebar.tsx             # App sidebar — includes Photo Factory link (ADOBE badge)
│   ├── query-provider.tsx      # TanStack QueryClientProvider
│   └── ui/                     # badge.tsx, button.tsx, card.tsx (Radix + CVA)
│
├── features/
│   ├── pc-inventory/           # Product cards, Shoptet XML service, Zod schemas
│   ├── content-generator/      # Content cards, SEO/hook/script services
│   ├── marketing-hub/          # Marketing Command Center route
│   └── ...
│
└── lib/
    ├── utils.ts                # cn() helper (clsx + tailwind-merge)
    ├── api-client.ts           # Shared API client
    └── prisma.ts               # Prisma client singleton

public/
├── photo-generator.html        # Visual Post Factory v3.0 (served)
├── hellocomp_logo_website.svg  # HelloComp logo (72 KB)
└── products-all.csv            # 52 curated gaming PCs

tools/
├── visual-post-factory/
│   └── photo-post-generator.html  # Source file (578 lines, v3.0)
└── content-automation/         # Python CLI: hooks, SEO, omnichannel, trending socials

data/
└── products-cache.json         # Full product cache (801 items from Shoptet XML)

prisma/
├── schema.prisma               # Database schema
└── migrations/                 # SQL migrations
```

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- **Dashboard** — `http://localhost:3000`
- **Photo Factory** — `http://localhost:3000/photo-generator.html`

### Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Data Layer

Product data flows from **Shoptet XML → products-cache.json → services**. The service files (`*-service.ts`) are the integration point — swap the mock call for a real API fetch without touching UI code.

- `fetchPCInventory()` — returns `PCProduct[]` (Shoptet XML or cache)
- `fetchContentItems()` — returns `ContentItem[]`
- `fetchSocialPosts()` — returns `SocialPost[]`

For the Photo Factory, product data is loaded from `products-all.csv` (52 curated items) directly in the browser.

---

## SEO & Integrations

- **Schema.org JSON-LD** — `ItemList` on PC Inventory, `WebPage` on Content Generator
- **OpenGraph** metadata on every page
- **RSS 2.0** feed at `/feed.xml` (with `media:content` and `atom:link`)
- **XML Sitemap** at `/sitemap.xml` (generated by Next.js `MetadataRoute`)
- **Shoptet XML Integration** — Connect hellocomp.cz e-shop for real product data ([docs-archive/SHOPTET_INTEGRATION.md](docs-archive/SHOPTET_INTEGRATION.md))
- **Adobe Express Embed SDK** — Client-side visual editing (BG removal, resize, effects)

---

## Documentation

All documentation is archived in [docs-archive/](docs-archive/):

| File | Description |
|------|-------------|
| [DOCS_INDEX.md](docs-archive/DOCS_INDEX.md) | Complete documentation map |
| [SYSTEM_PROFILE.md](docs-archive/SYSTEM_PROFILE.md) | Full system analysis |
| [SHOPTET_INTEGRATION.md](docs-archive/SHOPTET_INTEGRATION.md) | Connect hellocomp.cz Shoptet e-shop |
| [ONE_MAN_MARKETING_SYSTEM.md](docs-archive/ONE_MAN_MARKETING_SYSTEM.md) | Solo marketer workflow |
| [QUICK_REFERENCE.md](docs-archive/QUICK_REFERENCE.md) | One-page cheat sheet |

Visual factory planning docs:

| File | Description |
|------|-------------|
| [BRAND_VISUAL_SPEC.md](docs-archive/BRAND_VISUAL_SPEC.md) | Brand colors, typography, logo usage |
| [VISUAL_CONTENT_FACTORY_PLAN.md](docs-archive/VISUAL_CONTENT_FACTORY_PLAN.md) | Factory architecture & roadmap |
| [VISUAL_POST_FACTORY_PLAYBOOK.md](docs-archive/VISUAL_POST_FACTORY_PLAYBOOK.md) | Template playbook & usage guide |
| [ADOBE_BG_REMOVAL_SETUP.md](docs-archive/ADOBE_BG_REMOVAL_SETUP.md) | Adobe SDK setup & BG removal workflow |

See [docs-archive/README.md](docs-archive/README.md) for complete list.
