import type { Metadata } from "next";
import { MarketingHubRoute } from "@/features/marketing-hub/routes/marketing-hub-route";

export const metadata: Metadata = {
  title: "Marketing Command Center | HelloComp",
  description:
    "Sjednocený one-man marketing command center. Řiď SEO, social posts, video workflow a gaming PC e-shop content z jednoho místa s live checklist, timer a system status.",
  openGraph: {
    title: "Marketing Command Center | HelloComp",
    description:
      "Complete one-man marketing hub: daily checklist, focus timer, trending topics, system status, and quick access to all modules.",
    images: [
      { url: "https://hellocomp.cz/images/og-dashboard.jpg", alt: "HelloComp Command Center" },
    ],
  },
};

export default function DashboardPage() {
  return <MarketingHubRoute />;
}
