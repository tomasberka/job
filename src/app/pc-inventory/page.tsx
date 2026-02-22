import type { Metadata } from "next";
import { PCInventoryRoute } from "@/features/pc-inventory/routes/pc-inventory-route";

export const metadata: Metadata = {
  title: "Sklad PC | HelloComp",
  description:
    "Správa PC sestavů HelloComp GAMER SE, Pro a Max — specifikace, ceny, dostupnost.",
};

export default function PCInventoryPage() {
  return <PCInventoryRoute />;
}
