# Visual Content Factory Plan for HelloComp

## 1) Goal

Build a simple, scalable system that turns product data into high-quality visual creatives (banners, social cards, promo tiles) with minimal manual design work.

Primary objective: convince management that this is a practical, low-risk, high-output system.

## 2) What We Already Have (Strong Foundation)

- Live product ingestion from Shoptet XML
- Local JSON cache for fast and stable access
- Rich product fields available for creative generation:
  - product name
  - price
  - stock status
  - short description
  - tags/flags
  - multiple product images
- Existing dashboard where this can be integrated

This means we do not need to build data infrastructure from scratch.

## 3) Proposed Solution

Create a **Visual Content Factory** with three layers:

1. **Data Layer** (already solved)
   - XML → normalized cache (`products-cache.json`)
   - Consistent product fields for generation

2. **Template Layer**
   - Reusable design templates per use case:
     - Product Highlight (single SKU)
     - Price Drop / Promo
     - New Arrival
     - Category / Lineup banner (SE, Pro, Max)
   - Fixed slots in each template:
     - hero image
     - price block
     - short headline
     - CTA text

3. **Generation Layer**
   - Input: CSV (SKU list + campaign settings)
   - Engine: map product fields into template slots
   - Output: many ready-to-post graphics with consistent branding

## 4) UI Vision (Inside Dashboard)

Add a dedicated route (future): `/visual-factory`

Minimal MVP UI:

- Template selector
- CSV upload (or SKU picker)
- Campaign settings:
  - format (1:1, 4:5, 9:16, 16:9)
  - platform preset (IG, FB, TikTok cover, web banner)
  - CTA style (soft / hard sell)
- Preview grid
- Export button (PNG/JPG + CSV report)

Key principle: simple operations for high volume output.

## 5) Low-Cost AI Strategy (Optional, Controlled)

AI should assist only where it saves real time.

Use AI for:

- headline variants
- short CTA variants
- background enhancement suggestions
- automatic cropping/fit hints

Do **not** rely on AI for:

- core product facts (price/specs)
- final legal/product claims
- brand consistency decisions

Cost-safe approach:

- default non-AI template generation (always available)
- optional AI pass for text variants only
- cap AI calls per batch

## 6) Why This Is Worth It (Boss Argument)

### Business Value

- Faster campaign turnaround (hours to minutes)
- More creatives per campaign without hiring more designers
- Strong visual consistency across channels
- Better testing capability (more variants = better CTR opportunities)

### Risk Control

- Uses existing internal data pipeline
- Works even if AI is disabled
- Keeps manual approval step before publishing

### Operational Fit

- Perfect for one-man marketing workflow
- Reusable templates reduce dependency on ad-hoc design work
- Scales from 10 to 500+ creatives per month

## 7) Delivery Roadmap (Practical)

## Phase 1 — MVP (1 week)

- Define 3 core templates
- Define CSV input schema
- Build template filling logic from cache data
- Export static images for top 20 SKUs

**Success criteria:** produce first campaign pack in one afternoon.

## Phase 2 — Dashboard Integration (1 week)

- Add `/visual-factory` page
- Add template picker + CSV upload + preview
- Add bulk export and generation report

**Success criteria:** marketer can generate visuals without touching code.

## Phase 3 — Optimization (1–2 weeks)

- Add AI text variants (optional toggle)
- Add A/B naming convention and variant tracking
- Add performance feedback loop (which template performs best)

**Success criteria:** measurable improvement in engagement/sales campaigns.

## 8) What I Need From You to Execute Fast

### Brand Inputs (must-have)

- Logo files (SVG/PNG)
- Approved fonts and color rules
- CTA style examples
- 5 examples of visuals you consider "premium"

### Business Inputs

- Top priority channel (e.g. Instagram/Meta ads/web)
- Top 20 SKUs to prioritize first
- Campaign goals for next 30 days (traffic, leads, sales)

### Governance Inputs

- Who approves final creatives
- Which claims are forbidden
- Mandatory legal text (if any)

## 9) MVP CSV Format (Proposed)

```csv
sku,template,format,cta_variant,campaign_tag,priority
5573,product-highlight,1080x1350,strong,spring-drop,high
5580,price-promo,1080x1080,soft,weekend-deal,medium
```

The system enriches each row from XML/cache data:

- `name`
- `price`
- `shortDescription`
- `images[]`
- `flags[]`

## 10) Immediate Next Step

Run a pilot with:

- 3 templates
- 20 SKUs
- 2 formats
- 40–60 generated creatives

Then compare output speed and campaign quality versus current manual process.

---

If approved, this becomes HelloComp’s repeatable visual production engine: data-driven, template-first, and cost-controlled.
