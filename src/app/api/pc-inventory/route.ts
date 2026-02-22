import { NextResponse } from "next/server";
import { PC_INVENTORY_MOCK } from "@/features/pc-inventory/services/pc-inventory-mock";

export async function GET() {
  return NextResponse.json(PC_INVENTORY_MOCK);
}
