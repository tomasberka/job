# Visual Post Factory Playbook

Execution playbook for producing premium HelloComp posts quickly and consistently.

## Goal

- Primary objective: `sales`
- KPI proof: `orders`, `ROAS`, `revenue`
- Priority channel: `Instagram (@hellocompcz)`

## Brand Rules (Locked)

- Primary color: `#2166CC`
- Neutral black: `#111111`
- Primary type: `Source Sans 3`
- Approved positioning claim: `Herní počítače pro každého`

## Copy Rules

Use short, bold, action-first language.

Approved CTA set:

- `OBJEDNEJTE SI TEĎ`
- `POSUŇTE HRANICE VÝKONU`
- `ZAPOJ A HRAJ`

## Core Post Templates

## 1) Product Highlight

Best for top-selling SKU pushes.

- Format: `1080x1350`
- Headline formula: `[GPU/line] + výkonová výhoda`
- Support line: `Herní počítače pro každého`
- CTA: `OBJEDNEJTE SI TEĎ`

## 2) Price Performance

Best for value-segment conversion.

- Format: `1080x1080`
- Headline formula: `Výkon od [price] Kč`
- Support line: `Připraveno na hraní`
- CTA: `ZAPOJ A HRAJ`

## 3) Power Challenge

Best for high-margin gaming builds.

- Format: `1080x1920`
- Headline formula: `Posuňte hranice výkonu`
- Support line: `[CPU/GPU hero spec]`
- CTA: `POSUŇTE HRANICE VÝKONU`

## Weekly Production Cycle

1. Pull batch from `data/visual-post-factory-batch-v1.csv`
2. Generate 15–25 variants (3 templates × top SKUs)
3. Select top 5 for posting based on clarity + offer strength
4. Publish Instagram-first, then adapt to banner surfaces
5. Log weekly KPI proof (orders/revenue/ROAS)

## Data Inputs

- Product priority source: `data/top20-priority-skus.csv`
- Post-ready batch source: `data/visual-post-factory-batch-v1.csv`
- Photo batch source: `data/visual-post-photo-batch-v1.csv`
- Photo schema template: `data/visual-post-photo-schema.csv`
- Local generator: `tools/visual-post-factory/photo-post-generator.html`

## Photo-First Principle

- Product photo should occupy most of the creative area.
- Motion/gradient is support only (overlay layer), not the main visual.
- If `image_url` is missing, fill it before publishing.

## Quality Checklist

- Product image is dominant and clean
- Price is readable in 1 second
- CTA is visible without zoom
- Brand blue is used for action emphasis
- Text is under 14 words per visual block
