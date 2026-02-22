import type { Metadata } from "next";
import { MarketingHubRoute } from "@/features/marketing-hub/routes/marketing-hub-route";

export const metadata: Metadata = {
  title: "Marketing Hub | HelloComp",
  description:
    "Sjednocený one-man marketing hub pro SEO copywriting, social engagement, video workflow a gaming PC e-shop content.",
  openGraph: {
    title: "Marketing Hub | HelloComp",
    description:
      "SEO + copy + social + feed workflow v jednom dashboardu pro rychlý marketing execution.",
    images: [
      { url: "https://hellocomp.cz/images/og-dashboard.jpg", alt: "HelloComp Dashboard" },
    ],
  },
};

export default function DashboardPage() {
  return <MarketingHubRoute />;
}
