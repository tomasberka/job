# Adobe Background Removal Setup

This project now includes a secure server-side endpoint for background removal:

- `GET /api/image/remove-background` — health/config check
- `POST /api/image/remove-background` — remove image background via Adobe

## Why server-side

- API keys stay private in server env variables.
- No Adobe key is exposed in browser code.
- You can switch Adobe endpoint/headers without changing frontend code.

## 1) Configure environment

Copy values into your `.env.local`:

```dotenv
ADOBE_BG_REMOVE_ENABLED=true
ADOBE_BG_REMOVE_API_URL=YOUR_ADOBE_ENDPOINT
ADOBE_API_KEY=YOUR_ADOBE_API_KEY
ADOBE_API_KEY_HEADER=x-api-key
ADOBE_BG_REMOVE_IMAGE_FIELD=image
ADOBE_BG_REMOVE_OUTPUT_FORMAT_FIELD=output_format
ADOBE_BG_REMOVE_OUTPUT_FORMAT=png
ADOBE_BG_REMOVE_TIMEOUT_MS=30000
ADOBE_BG_REMOVE_MAX_INPUT_BYTES=15000000
ADOBE_BG_REMOVE_ALLOWED_HOSTS=cdn.myshoptet.com,*.hellocomp.cz
ADOBE_BG_REMOVE_RATE_LIMIT_WINDOW_SEC=60
ADOBE_BG_REMOVE_RATE_LIMIT_MAX=30
```

## 2) Quick health check

```bash
curl http://localhost:3000/api/image/remove-background
```

Expected fields:

- `enabled`: `true`
- `configured`: `true`
- `mode`: `server-proxy`

## 3) Test background removal

```bash
curl -X POST http://localhost:3000/api/image/remove-background \
  -H "Content-Type: application/json" \
  -d '{"imageUrl":"https://your-domain.com/example-product.jpg","outputFormat":"png"}'
```

Response returns one of:

- `outputImageUrl` (Adobe returned URL)
- `outputImageDataUrl` (Adobe returned binary image, encoded as data URL)

## 4) Allowed domains in Adobe dashboard (if using browser key)

If Adobe requires browser key restrictions, use domains like:

- `localhost:3000`
- `hellocomp.cz`
- `www.hellocomp.cz`
- `*.vercel.app` (or your exact staging domain)

For this project, server-proxy mode is preferred.

## Request payload contract

`POST /api/image/remove-background`

```json
{
  "imageUrl": "https://...",
  "outputFormat": "png"
}
```

## Notes

- Input must be a direct image URL.
- Default max input size is 15 MB.
- If Adobe API contract differs, adjust `ADOBE_*_FIELD` env variables.
- `ADOBE_BG_REMOVE_ALLOWED_HOSTS` should list only trusted image CDNs.
- Rate limits apply per IP and reset every window.
