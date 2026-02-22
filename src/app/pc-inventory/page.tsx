import type { Metadata } from "next";
import { PCInventoryRoute } from "@/features/pc-inventory/routes/pc-inventory-route";

export const metadata: Metadata = {
  title: "PC Inventory | HelloComp",
  description:
    "Manage HelloComp GAMER SE, Pro and Max PC lineups — specs, pricing, availability.",
};

export default function PCInventoryPage() {
  return <PCInventoryRoute />;
}
