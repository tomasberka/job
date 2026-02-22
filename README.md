# HelloComp — Řídicí panel

Internal Next.js dashboard for [HelloComp](https://hellocomp.cz) — a Czech gaming PC brand. Manages product stock, content production, and video workflow in one place.

---

## Features

| Module | Route | Description |
|---|---|---|
| **PC Inventory** | `/` · `/pc-inventory` | Gaming PC stock overview — GAMER SE, Pro, Max lineups with live status and specs |
| **Content Generator** | `/content-generator` | TikTok hooks, SEO metadata, video scripts per product SKU |
| **Trending Social Posts** | `/social-posts` | 🆕 AI-powered social media posts with trend awareness (TikTok, Instagram, Twitter, LinkedIn, YouTube Shorts) |
| **Video Workflow** | `/video-workflow` | DaVinci Resolve export tracker — status, progress, format, platform |
| **RSS Feed** | `/feed.xml` | Product RSS feed for hellocomp.cz (media:content, atom:link) |
| **Sitemap** | `/sitemap.xml` | Next.js sitemap with per-page priorities and product images |

---

## Tech Stack

- **Framework** — [Next.js 15](https://nextjs.org) (App Router, React 19)
- **Language** — TypeScript 5
- **Styling** — Tailwind CSS 3 + `class-variance-authority`
- **UI components** — Radix UI (Dialog, DropdownMenu, Tooltip, Separator, Slot)
- **Data fetching** — TanStack React Query 5
- **Animations** — Framer Motion 11
- **Icons** — Lucide React
- **Validation** — Zod 3
- **Linting** — ESLint (Next.js config)

---

## Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout — Sidebar + QueryProvider wrapper
│   ├── page.tsx                # Dashboard home → renders PCInventoryRoute
│   ├── globals.css             # Global styles
│   ├── sitemap.ts              # /sitemap.xml — Next.js MetadataRoute
│   ├── feed.xml/
│   │   └── route.ts            # /feed.xml — RSS 2.0 product feed
│   ├── pc-inventory/
│   │   └── page.tsx            # /pc-inventory page
│   ├── content-generator/
│   │   └── page.tsx            # /content-generator page
│   └── video-workflow/
│       └── page.tsx            # /video-workflow page
│
├── components/
│   ├── sidebar.tsx             # App sidebar with navigation links
│   ├── query-provider.tsx      # TanStack QueryClientProvider
│   └── ui/
│       ├── badge.tsx           # Status badge (Radix Slot + CVA)
│       ├── button.tsx          # Button (CVA variants)
│       └── card.tsx            # Card container
│
├── features/
│   ├── pc-inventory/
│   │   ├── components/
│   │   │   └── pc-product-card.tsx     # Product card with specs, status, price
│   │   ├── routes/
│   │   │   └── pc-inventory-route.tsx  # Page-level component with JSON-LD
│   │   ├── services/
│   │   │   ├── pc-inventory-service.ts # fetchPCInventory() — wraps mock
│   │   │   └── pc-inventory-mock.ts    # Static PC product data (4 SKUs)
│   │   └── types/
│   │       └── pc-product.ts           # Zod schemas: PCProduct, PCSpecs, PCStatus
│   │
│   ├── content-generator/
│   │   ├── components/
│   │   │   └── content-card.tsx        # Content item card (type, status, body)
│   │   ├── routes/
│   │   │   └── content-generator-route.tsx  # Page-level component with JSON-LD
│   │   ├── services/
│   │   │   ├── content-service.ts      # fetchContentItems() — wraps mock
│   │   │   └── content-mock.ts         # 3 sample content items
│   │   └── types/
│   │       └── content-item.ts         # Zod schemas: ContentItem, ContentType, ContentStatus
│   │
│   └── video-workflow/
│       ├── components/
│       │   └── video-export-card.tsx   # Export card with progress, format, platform
│       ├── routes/
│       │   └── video-workflow-route.tsx  # Page-level component with JSON-LD
│       ├── services/
│       │   ├── video-workflow-service.ts # fetchVideoExports() — wraps mock
│       │   └── video-workflow-mock.ts    # 4 sample video export records
│       └── types/
│           └── video-export.ts         # Zod schemas: VideoExport, VideoFormat, VideoExportStatus
│
└── lib/
    └── utils.ts                # cn() helper (clsx + tailwind-merge)
```

Root config files:

| File | Purpose |
|---|---|
| `next.config.mjs` | Next.js config — `reactStrictMode`, remote image hostname |
| `tailwind.config.ts` | Tailwind configuration |
| `postcss.config.mjs` | PostCSS config |
| `tsconfig.json` | TypeScript config (`@/` path alias → `./src`) |
| `.eslintrc.json` | ESLint config (extends `next/core-web-vitals`) |
| `next-env.d.ts` | Next.js TypeScript declarations (auto-generated) |
| `sitemap0.xml` | Static sitemap snapshot |
| `products (1).csv` | Source product data used to seed mock data |

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Data Layer

All data is currently served from **static mock files** (`*-mock.ts`). The service files (`*-service.ts`) are the single integration point — swap the mock call for a real API fetch to connect a backend without touching any UI code.

- `fetchPCInventory()` — returns `PCProduct[]`
- `fetchContentItems()` — returns `ContentItem[]`
- `fetchVideoExports()` — returns `VideoExport[]`

---

## SEO & Integrations

- **Schema.org JSON-LD** — `ItemList` on PC Inventory, `WebPage` on Content Generator and Video Workflow
- **OpenGraph** metadata on every page
- **RSS 2.0** feed at `/feed.xml` (with `media:content` and `atom:link`)
- **XML Sitemap** at `/sitemap.xml` (generated by Next.js `MetadataRoute`)
