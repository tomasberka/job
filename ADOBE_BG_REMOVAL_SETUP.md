# Adobe Background Removal Setup

This project supports **two approaches** for removing image backgrounds:

1. **Adobe Express Embed SDK** (recommended) — client-side, opens Adobe's UI in an iframe
2. **Server-side proxy** — your Next.js server calls Adobe API on behalf of the client

---

## Option A: Adobe Express Embed SDK (Recommended)

The Embed SDK runs **entirely in the browser**. No server proxy needed. Adobe handles all the processing in their iframe.

### 1) Get your Client ID

1. Go to [Adobe Developer Console](https://developer.adobe.com/console)
2. Click **Create project** → select **Adobe Express Embed SDK**
3. Set **Credential name** (= `appName` in SDK init): `HelloComp Photo Factory`
4. Set **Allowed domains**:
   - `localhost` (for local dev — specify port if needed, e.g. `localhost:5555`)
   - `hellocomp.cz`
   - `www.hellocomp.cz`
   - Your Vercel/staging domain
5. Copy the **Client ID** (also called API Key)

> **Important**: All connections must be HTTPS for both production and development.

### 2) Configure

Add to `.env.local`:

```dotenv
NEXT_PUBLIC_ADOBE_EXPRESS_CLIENT_ID=your-client-id-here
NEXT_PUBLIC_ADOBE_EXPRESS_APP_NAME=HelloComp Photo Factory
```

For the standalone HTML tool (`photo-post-generator.html`), paste the Client ID directly in the input field.

### 3) Use in Photo Post Factory

1. Open `tools/visual-post-factory/photo-post-generator.html`
2. Paste your **Client ID** in the input field
3. Click **Inicializovat SDK** — status should show "SDK Ready ✓"
4. Two ways to remove backgrounds:
   - **Per card**: Click the ✂ Remove BG button on any card
   - **Batch**: Click "Remove BG (vše)" to process all images sequentially

Each image opens an Adobe Express modal where you can see the result and click "Uložit do generátoru" to apply it.

### 4) How it works

```
User clicks "Remove BG"
  → Image fetched & converted to base64
  → quickAction.removeBackground() opens Adobe modal
  → User reviews result, clicks "Uložit do generátoru"
  → onPublish callback receives processed base64 image
  → CSV row updated with data URL → card re-rendered
```

### Available quick actions

The Embed SDK also supports these one-click tools:
- `removeBackground()` — remove image background
- `cropImage()` — crop
- `resizeImage()` — resize
- `convertToPNG()` / `convertToJPEG()` — format conversion
- `generateQRCode()` — QR codes

---

## Option B: Server-side proxy

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

---

## Webhook (Async) Mode

For long-running Adobe operations, use async mode. Your request returns immediately with a job ID that you can poll.

### New endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/image/remove-background` | Add `"async": true` to use webhook mode |
| POST | `/api/image/webhook/callback` | Adobe calls this when processing is done |
| GET | `/api/image/webhook/status/{jobId}` | Poll job status |
| GET | `/api/image/webhook/jobs` | List recent jobs |

### Environment variables

```dotenv
# Shared secret for validating Adobe callbacks (generate: openssl rand -hex 32)
ADOBE_WEBHOOK_SECRET=your-strong-secret

# Publicly reachable callback URL (Adobe must reach this)
ADOBE_WEBHOOK_CALLBACK_URL=https://hellocomp.cz/api/image/webhook/callback
```

### Trigger async removal

```bash
curl -X POST http://localhost:3000/api/image/remove-background \
  -H "Content-Type: application/json" \
  -d '{"imageUrl":"https://cdn.example.com/photo.jpg","async":true}'
```

Response (HTTP 202):

```json
{
  "mode": "async",
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "statusUrl": "/api/image/webhook/status/550e8400-e29b-41d4-a716-446655440000",
  "callbackUrl": "https://hellocomp.cz/api/image/webhook/callback?jobId=550e..."
}
```

### Poll job status

```bash
curl http://localhost:3000/api/image/webhook/status/{jobId}
```

Possible `status` values: `pending`, `processing`, `completed`, `failed`.

### Webhook callback security

Adobe (or any external caller) must include the shared secret in the `x-webhook-secret` header:

```bash
curl -X POST 'http://localhost:3000/api/image/webhook/callback?jobId=YOUR_JOB_ID' \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: your-strong-secret" \
  -d '{"status":"success","output":{"href":"https://adobe-cdn/result.png"}}'
```

**If `ADOBE_WEBHOOK_SECRET` is not set, ALL callbacks are rejected** for safety.

### Job lifecycle

1. Client sends `POST /api/image/remove-background` with `"async": true` → job created (`pending`)
2. Server dispatches Adobe request → job becomes `processing`
3. Adobe calls `/api/image/webhook/callback` with result → job becomes `completed` or `failed`
4. Client polls `/api/image/webhook/status/{jobId}` to get final result
5. Jobs expire after 1 hour. Max 500 jobs in memory.
