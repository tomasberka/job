import type { Metadata } from "next";
import { PCInventoryRoute } from "@/features/pc-inventory/routes/pc-inventory-route";

export const metadata: Metadata = {
  title: "Přehled | HelloComp",
  description:
    "HelloComp řídicí panel — správa PC sestavů, tvorba obsahu a sledování video produkce.",
  openGraph: {
    images: [
      { url: "https://hellocomp.cz/images/og-dashboard.jpg", alt: "HelloComp Dashboard" },
    ],
  },
};

export default function DashboardPage() {
  return <PCInventoryRoute />;
}
