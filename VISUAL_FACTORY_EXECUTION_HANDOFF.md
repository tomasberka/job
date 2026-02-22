# Visual Factory Execution Handoff

This document captures delivered inputs and remaining decisions before coding the `/visual-factory` MVP.

## Delivered Inputs

## Brand

- Logo: `hellocomp_logo_website.svg`
- Brand black: `#111111`
- Brand blue: `#2166CC`
- Primary font direction: `Source Sans 3`
- Off-site fallback direction: system-ui chain

See: `BRAND_VISUAL_SPEC.md`

## Messaging

Approved CTA examples:

- `OBJEDNEJTE SI TEĎ`
- `POSUŇTE HRANICE VÝKONU`
- `ZAPOJ A HRAJ`

## Channel Priority

- Primary channel: `Instagram (@hellocompcz)`
- Production rule: Instagram-first creative sizing and layout.

## Product Priorities

- Top 20 priority products prepared in:
  - `data/top20-priority-skus.csv`

## Post Factory Assets (Ready)

- Playbook: `VISUAL_POST_FACTORY_PLAYBOOK.md`
- Post batch file: `data/visual-post-factory-batch-v1.csv`
- Photo generator: `tools/visual-post-factory/photo-post-generator.html`
- Photo batch file: `data/visual-post-photo-batch-v1.csv`
- Photo schema: `data/visual-post-photo-schema.csv`

## MVP Defaults (proposed)

- Template set:
  1. Product Highlight
  2. Price Promo
  3. Performance Hook
- First export sizes:
  - `1080x1350` (IG feed)
  - `1080x1920` (Stories/Reels cover)
- Output naming:
  - `{rank}_{template}_{format}_{product_name_slug}.png`

## Remaining Decisions (Blockers)

1. Compliance guardrails:
   - forbidden claims list
   - mandatory legal lines

## 30-Day Objective (Confirmed)

- Primary objective: `sales`
- KPI focus: `orders`, `ROAS`, `revenue`

## Visible Proof of Performance (Reporting)

For each campaign batch, track and present:

1. `Orders generated` (count)
2. `Revenue generated` (CZK)
3. `ROAS` (revenue / ad spend)
4. `Top 5 winning creatives` (by orders and ROAS)
5. `Before vs after` comparison (previous 30 days vs current 30 days)

Recommended weekly proof format:

- one screenshot/table for KPI totals
- one ranked creative leaderboard
- one short summary: what worked, what changed next week

## Approval Owner (Confirmed)

- `Tomáš Berka` — Marketing, content creator, SEO and copywriting specialist for HelloComp

## Build-Ready Status

- Data foundation: ready
- Brand foundation: ready
- Priority products: ready
- KPI objective: ready (`sales`)
- MVP implementation: ready after compliance inputs
