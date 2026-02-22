import { PC_INVENTORY_MOCK } from "@/features/pc-inventory/services/pc-inventory-mock";

const BASE_URL = "https://hellocomp.cz";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const items = PC_INVENTORY_MOCK.map((p) => {
    const statusLabel =
      p.status === "in-stock"
        ? "Skladem"
        : p.status === "low-stock"
        ? "Poslední kusy"
        : p.status === "pre-order"
        ? "Předobjednávka"
        : "Vyprodáno";

    const enclosure = p.imageUrl
      ? `<enclosure url="${escapeXml(p.imageUrl)}" type="image/jpeg" />`
      : "";

    const image = p.imageUrl
      ? `<media:content url="${escapeXml(p.imageUrl)}" medium="image" />`
      : "";

    return `
    <item>
      <title><![CDATA[${p.name} — ${p.price.toLocaleString("cs-CZ")} Kč]]></title>
      <link>${BASE_URL}/pc-inventory</link>
      <guid isPermaLink="false">${BASE_URL}/products/${p.sku}</guid>
      <description><![CDATA[${p.specs.cpu} | ${p.specs.gpu} | ${p.specs.ram} | ${statusLabel}]]></description>
      <pubDate>${new Date(p.updatedAt).toUTCString()}</pubDate>
      ${enclosure}
      ${image}
    </item>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:media="http://search.yahoo.com/mrss/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>HelloComp — herní PC sestavy</title>
    <link>${BASE_URL}</link>
    <description>Aktuální nabídka herních PC od HelloComp.cz — GAMER SE, Pro a Max série.</description>
    <language>cs</language>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>https://hellocomp.cz/images/og-dashboard.jpg</url>
      <title>HelloComp</title>
      <link>${BASE_URL}</link>
    </image>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
