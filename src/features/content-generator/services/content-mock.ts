import type { ContentItem } from "../types/content-item";

export const CONTENT_MOCK: ContentItem[] = [
  {
    id: "cg-001",
    type: "tiktok-hook",
    productSku: "HC-GAMER-MAX-001",
    title: "RTX 4090 Hook — 3s open",
    body: "POV: You just bought the most powerful gaming PC in Czech Republic 🔥 #gaming #pc #rtx4090 #hellocomp",
    status: "approved",
    tags: ["tiktok", "gaming", "rtx4090"],
    createdAt: "2024-12-01T09:00:00.000Z",
    updatedAt: "2024-12-01T12:00:00.000Z",
  },
  {
    id: "cg-002",
    type: "seo-meta",
    productSku: "HC-GAMER-PRO-001",
    title: "GAMER Pro — Meta description",
    body: "HelloComp GAMER Pro — RTX 4070 Ti Super gaming PC. Ryzen 7 7800X3D, 32 GB DDR5. Ideální pro 1440p gaming. Doprava zdarma. Kup na hellocomp.cz.",
    status: "published",
    tags: ["seo", "meta", "gamer-pro"],
    createdAt: "2024-11-20T09:00:00.000Z",
    updatedAt: "2024-11-25T10:00:00.000Z",
  },
  {
    id: "cg-003",
    type: "video-script",
    productSku: "HC-GAMER-SE-001",
    title: "GAMER SE — YouTube unboxing script",
    body: "Intro: [0:00] — Co dostanete za 25k? HelloComp GAMER SE unboxing!\nSetup: [0:15] — Otevíráme krabici a procházíme obsah.\nSpecs: [1:00] — Ryzen 5 7600X + RTX 4060 — test výkonu.\nConclusion: [3:00] — Je to nejlepší entry-level gaming PC na CZ trhu?",
    status: "draft",
    tags: ["youtube", "script", "gamer-se"],
    createdAt: "2024-12-10T14:00:00.000Z",
    updatedAt: "2024-12-10T14:30:00.000Z",
  },
];
