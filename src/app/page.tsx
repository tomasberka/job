import type { Metadata } from "next";
import { PCInventoryRoute } from "@/features/pc-inventory/routes/pc-inventory-route";

export const metadata: Metadata = {
  title: "Dashboard | HelloComp",
  description:
    "HelloComp Social & Content Dashboard — PC lineup management, content automation and video workflow.",
};

export default function DashboardPage() {
  return <PCInventoryRoute />;
}
