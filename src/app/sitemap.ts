import type { MetadataRoute } from "next";
import { PC_INVENTORY_MOCK } from "@/features/pc-inventory/services/pc-inventory-mock";

const BASE_URL = "https://hellocomp.cz";

export default function sitemap(): MetadataRoute.Sitemap {
  const productImages = PC_INVENTORY_MOCK.filter((p) => p.imageUrl).map(
    (p) => p.imageUrl as string
  );

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
      images: ["https://hellocomp.cz/images/og-dashboard.jpg"],
    },
    {
      url: `${BASE_URL}/pc-inventory`,
      lastModified: new Date(
        Math.max(...PC_INVENTORY_MOCK.map((p) => new Date(p.updatedAt).getTime()))
      ),
      changeFrequency: "daily",
      priority: 0.9,
      images: productImages,
    },
    {
      url: `${BASE_URL}/content-generator`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
      images: ["https://hellocomp.cz/images/og-content.jpg"],
    },
    {
      url: `${BASE_URL}/video-workflow`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
      images: ["https://hellocomp.cz/images/og-video.jpg"],
    },
  ];
}
