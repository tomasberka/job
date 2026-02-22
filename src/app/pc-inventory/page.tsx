import type { Metadata } from "next";
import { PCInventoryRoute } from "@/features/pc-inventory/routes/pc-inventory-route";

export const metadata: Metadata = {
  title: "Sklad PC | HelloComp",
  description:
    "Správa PC sestavů HelloComp GAMER SE, Pro a Max — specifikace, ceny, dostupnost.",
  openGraph: {
    images: [
      { url: "https://hellocomp.cz/images/products/gamer-se.jpg", alt: "HelloComp GAMER SE" },
      { url: "https://hellocomp.cz/images/products/gamer-pro.jpg", alt: "HelloComp GAMER Pro" },
      { url: "https://hellocomp.cz/images/products/gamer-max.jpg", alt: "HelloComp GAMER Max" },
    ],
  },
};

export default function PCInventoryPage() {
  return <PCInventoryRoute />;
}
