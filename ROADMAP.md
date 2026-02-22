# Roadmap

Development plan for the HelloComp dashboard — ordered by logical dependency.

---

## Phase 1 — Foundation ✅ (current)

Core UI scaffolding with static mock data.

- [x] Next.js 15 App Router project with TypeScript and Tailwind CSS
- [x] Sidebar navigation (PC Inventory, Content Generator, Video Workflow)
- [x] PC Inventory — product cards with specs, status badges, price (CZK)
- [x] Content Generator — content item cards (TikTok hook, SEO meta, video script)
- [x] Video Workflow — export cards with progress bar, format, platform
- [x] TanStack React Query integration (mock services as query functions)
- [x] Zod validation schemas for all domain types
- [x] Schema.org JSON-LD on each page
- [x] OpenGraph metadata per page
- [x] RSS 2.0 feed at `/feed.xml`
- [x] XML Sitemap at `/sitemap.xml`

---

## Phase 2 — Real Data

Replace mock files with live API calls. No UI changes needed — only the service layer.

- [ ] Set up a backend API (REST or tRPC) or connect to a headless CMS / database
- [ ] Replace `fetchPCInventory()` with a real endpoint; keep `PCProduct` Zod schema for response validation
- [ ] Replace `fetchContentItems()` with a real endpoint; validate with `ContentItemSchema`
- [ ] Replace `fetchVideoExports()` with a real endpoint; validate with `VideoExportSchema`
- [ ] Add environment variable config (`NEXT_PUBLIC_API_URL`, server-side secrets)
- [ ] Add React Query error states and retry logic to all routes
- [ ] Implement revalidation strategy (ISR or on-demand) for `/feed.xml` and `/sitemap.xml`

---

## Phase 3 — CRUD & Mutations

Allow editing data directly from the dashboard.

- [ ] **PC Inventory** — add/edit/delete product, update stock count, change status
- [ ] **Content Generator** — create new content item, edit body, change status (draft → review → approved → published)
- [ ] **Video Workflow** — add export job, update progress/status, link DaVinci project
- [ ] Optimistic updates via TanStack Query `useMutation`
- [ ] Form validation with Zod + React Hook Form
- [ ] Toast / notification system for mutation feedback

---

## Phase 4 — Authentication & Access Control

Secure the dashboard behind a login wall.

- [ ] Add authentication (NextAuth.js / Auth.js or a third-party provider)
- [ ] Role-based access: viewer (read-only) vs. editor (full CRUD)
- [ ] Protect all routes with middleware
- [ ] Session-aware sidebar (display logged-in user)

---

## Phase 5 — AI Content Generation

Automate content creation for products.

- [ ] Integrate OpenAI API (or similar) into the Content Generator
- [ ] One-click generation of TikTok hooks from a product SKU
- [ ] Auto-generate SEO meta descriptions from specs
- [ ] Draft video script outline from product data
- [ ] Token usage tracking and cost visibility

---

## Phase 6 — Analytics & Reporting

Add visibility into performance across all modules.

- [ ] **PC Inventory** — stock level history chart, low-stock alerts
- [ ] **Content Generator** — publication rate by content type, status funnel
- [ ] **Video Workflow** — average export time, failure rate, platform breakdown
- [ ] Dashboard home page with aggregated KPI cards
- [ ] CSV / JSON export for all data tables

---

## Phase 7 — Production Hardening

Prepare for a stable, maintainable production deployment.

- [ ] Unit tests for Zod schemas and service functions (Vitest)
- [ ] Component tests for cards and route-level components (Testing Library)
- [ ] CI pipeline (lint → type-check → test → build)
- [ ] Docker image for self-hosted deployment
- [ ] Dependency update automation (Renovate or Dependabot)
- [ ] Lighthouse budget enforcement (performance, SEO, accessibility)
