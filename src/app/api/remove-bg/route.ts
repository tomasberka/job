import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// ─── Persistent disk cache: public/data/bg-cache/<sha256>.png ───
const CACHE_DIR = join(process.cwd(), 'public', 'data', 'bg-cache');

function ensureCacheDir() {
    if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });
}

/** SHA-256 hash of a string → 12-char hex key (collision-free for URLs) */
function cacheKey(input: string): string {
    return createHash('sha256').update(input).digest('hex').slice(0, 16);
}

function getCachePath(key: string): string {
    return join(CACHE_DIR, key + '.png');
}

// Dynamic import to avoid bundling issues with onnxruntime-node
let removeBackgroundFn: ((image: Blob, config?: object) => Promise<Blob>) | null = null;

async function getRemoveBackground() {
    if (!removeBackgroundFn) {
        const mod = await import('@imgly/background-removal-node');
        removeBackgroundFn = mod.removeBackground;
    }
    return removeBackgroundFn;
}

/**
 * GET /api/remove-bg?url=<encoded-url>
 * Check if a cached version exists. Returns 200 with the cached PNG, or 404.
 * Client uses this to skip re-processing.
 */
export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url');
    if (!url) return NextResponse.json({ error: 'Missing ?url=' }, { status: 400 });

    ensureCacheDir();
    const key = cacheKey(url);
    const path = getCachePath(key);

    if (existsSync(path)) {
        const buf = readFileSync(path);
        return new NextResponse(buf, {
            headers: {
                'Content-Type': 'image/png',
                'X-Cache': 'HIT',
                'X-Cache-Key': key,
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=86400',
            },
        });
    }
    return NextResponse.json({ cached: false, key }, { status: 404 });
}

/**
 * POST /api/remove-bg
 * 
 * Accepts:
 *   - JSON { url: "https://..." }  → server fetches, checks cache, processes, saves
 *   - Raw image bytes (Content-Type: image/*) → processes directly (no cache for raw)
 * 
 * Returns: PNG with background removed. Auto-saves to disk cache.
 */
export async function POST(request: NextRequest) {
    try {
        let imageBlob: Blob;
        let sourceUrl: string | null = null;
        const contentType = request.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
            const { url } = await request.json();
            if (!url || typeof url !== 'string') {
                return NextResponse.json({ error: 'Missing url in JSON body' }, { status: 400 });
            }
            sourceUrl = url;

            // ── CHECK CACHE FIRST ──
            ensureCacheDir();
            const key = cacheKey(sourceUrl);
            const cachePath = getCachePath(key);
            if (existsSync(cachePath)) {
                console.log(`[BG Cache HIT] ${key} → ${sourceUrl.slice(0, 60)}...`);
                const buf = readFileSync(cachePath);
                return new NextResponse(buf, {
                    headers: {
                        'Content-Type': 'image/png',
                        'X-Cache': 'HIT',
                        'X-Cache-Key': key,
                        'Access-Control-Allow-Origin': '*',
                        'Cache-Control': 'public, max-age=86400',
                    },
                });
            }

            // Not cached → fetch the image server-side (no CORS)
            const imgResponse = await fetch(url, {
                headers: { 'User-Agent': 'HelloComp-PhotoFactory/5.3' },
            });
            if (!imgResponse.ok) {
                return NextResponse.json({ error: 'Failed to fetch image: ' + imgResponse.status }, { status: 502 });
            }
            imageBlob = await imgResponse.blob();
        } else {
            // Raw image bytes — hash the bytes for cache key
            const buffer = await request.arrayBuffer();
            if (buffer.byteLength < 100) {
                return NextResponse.json({ error: 'Image too small or empty' }, { status: 400 });
            }
            // Use bytes hash as cache key for raw uploads
            const bytesHash = createHash('sha256').update(Buffer.from(buffer)).digest('hex').slice(0, 16);
            ensureCacheDir();
            const cachePath = getCachePath(bytesHash);
            if (existsSync(cachePath)) {
                console.log(`[BG Cache HIT] raw:${bytesHash}`);
                const buf = readFileSync(cachePath);
                return new NextResponse(buf, {
                    headers: {
                        'Content-Type': 'image/png',
                        'X-Cache': 'HIT',
                        'X-Cache-Key': bytesHash,
                        'Access-Control-Allow-Origin': '*',
                        'Cache-Control': 'public, max-age=86400',
                    },
                });
            }
            sourceUrl = '__raw__' + bytesHash;
            imageBlob = new Blob([buffer], { type: contentType || 'image/png' });
        }

        // ── PROCESS: Remove background ──
        const removeBackground = await getRemoveBackground();
        const resultBlob = await removeBackground(imageBlob, {
            model: 'small',
            output: { format: 'image/png', quality: 0.9 },
        });

        const resultBuffer = Buffer.from(await resultBlob.arrayBuffer());

        // ── SAVE TO CACHE immediately ──
        if (sourceUrl) {
            ensureCacheDir();
            const key = sourceUrl.startsWith('__raw__') ? sourceUrl.slice(7) : cacheKey(sourceUrl);
            const cachePath = getCachePath(key);
            try {
                writeFileSync(cachePath, resultBuffer);
                console.log(`[BG Cache SAVE] ${key} → ${resultBuffer.length} bytes`);
            } catch (writeErr) {
                console.error('[BG Cache WRITE ERROR]', writeErr);
            }
        }

        return new NextResponse(resultBuffer, {
            headers: {
                'Content-Type': 'image/png',
                'X-Cache': 'MISS',
                'X-Cache-Key': sourceUrl ? cacheKey(sourceUrl) : 'none',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=86400',
            },
        });
    } catch (e: unknown) {
        console.error('BG removal error:', e);
        return NextResponse.json(
            { error: 'BG removal failed: ' + (e instanceof Error ? e.message : String(e)) },
            { status: 500 }
        );
    }
}

// Handle preflight CORS
export async function OPTIONS() {
    return new NextResponse(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
