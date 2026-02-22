# HelloComp Brand Visual Spec (v2)

Official reference for web, banners, email, social creatives, and print.

## Logo Asset

- Primary logo file: `hellocomp_logo_website.svg`

## Approved Core Colors

These values are approved as the source of truth for production:

- **Brand Black (logo text "hello comp")**
  - HEX: `#111111`
  - RGB: `17, 17, 17`

- **Brand Blue (smile element)**
  - HEX: `#2166CC`
  - RGB: `33, 102, 204`

## Typography

### Primary Brand Typeface

- Primary: `Source Sans 3` (formerly `Source Sans Pro`)
- Use `400` for body/UI text and `700` for CTA emphasis.
- Banner headline style: `900`, uppercase, tight tracking (around `-0.5px`).

### E-shop Font Stack (Shoptet)

```css
font-family: 'Source Sans 3', 'Source Sans Pro',
             ui-sans-serif, system-ui, -apple-system,
             'Segoe UI', Roboto, Arial, sans-serif;
```

### Off-site Font Stack (ads/emails/social/docs)

```css
font-family: ui-sans-serif, system-ui, -apple-system,
             BlinkMacSystemFont, 'Segoe UI', Roboto,
             'Helvetica Neue', Arial, sans-serif;
```

### Extended Universal Fallback Chain (if needed)

```css
font-family:
  var(--pplx-sans), ui-sans-serif, system-ui, -apple-system,
  BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
  'Noto Sans', sans-serif,
  'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji',
  'Hiragino Sans', 'PingFang SC', 'Apple SD Gothic Neo', 'Yu Gothic',
  'Microsoft YaHei', 'Microsoft JhengHei', Meiryo;
```

## CTA Voice System

Tone pattern for all CTA/hook copy:

- short
- bold
- uppercase
- verb-led
- performance/readiness focused

Avoid discount-led language as primary message.

Approved CTA examples:

1. `OBJEDNEJTE SI TEĎ`
2. `POSUŇTE HRANICE VÝKONU`
3. `ZAPOJ A HRAJ`

## Approved Positioning Claim

- `Herní počítače pro každého`

Usage guidance:

- Approved as a brand-level positioning line across web banners, social creatives, and campaign headers.
- Prefer as secondary headline or support claim, not as a legal/technical performance promise.

## Visual Direction (Premium References)

Preferred art direction aligned with current HelloComp aesthetic:

1. White RGB gaming PC on dark/blue diagonal hero background
2. Contest/social promo with dark base + RGB glow + clear handle/CTA
3. GPU close-up with performance headline
4. Clean product card (white card, strong image, stock badge)
5. Reels-style dark RGB showcase with minimal text overlay

## Channel Priority

- Priority channel: `Instagram (@hellocompcz)`
- Production default: design assets Instagram-first, then adapt for web banners.

## Usage Rules

- Use **Brand Blue** as primary accent for buttons, links, highlights, badges, and CTA emphasis.
- Use **Brand Black** for logo text treatment and dark neutral typography where applicable.
- Keep product photo area visually dominant; color system should support, not overpower, the product image.
- For generated banners, always ensure readable contrast between headline/price and background image.

## Visual Factory Mapping

- `primary`: `#2166CC`
- `neutral-900`: `#111111`
- `font-primary`: `Source Sans 3`
- `font-fallback-ui`: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`

These tokens must be used consistently in template exports and UI previews.

## Notes

- This spec reflects approved values provided for production use.
- If future logo updates arrive, update this file first and treat it as canonical.