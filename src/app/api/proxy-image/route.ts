import { NextRequest, NextResponse } from 'next/server';

/**
 * Image proxy to bypass CORS restrictions for BG removal.
 * Usage: /api/proxy-image?url=https://cdn.myshoptet.com/...
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  // Only allow image URLs from trusted domains
  const allowed = ['cdn.myshoptet.com', 'www.hellocomp.cz', 'hellocomp.cz'];
  try {
    const parsed = new URL(url);
    if (!allowed.some(d => parsed.hostname === d || parsed.hostname.endsWith('.' + d))) {
      return NextResponse.json({ error: 'Domain not allowed' }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'HelloComp-PhotoFactory/5.2' },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Upstream error: ' + response.status }, { status: 502 });
    }

    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': response.headers.get('content-type') || 'image/png',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: 'Fetch failed: ' + (e instanceof Error ? e.message : String(e)) },
      { status: 500 }
    );
  }
}
