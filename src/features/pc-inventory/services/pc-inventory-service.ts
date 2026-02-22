import { PC_INVENTORY_MOCK } from "./pc-inventory-mock";
import { PCProductSchema, type PCProduct, type PCLineup } from "../types/pc-product";
import { apiGet, useMocks } from "@/lib/api-client";
import { z } from "zod";

export async function fetchPCInventory(): Promise<PCProduct[]> {
  if (useMocks()) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return PC_INVENTORY_MOCK;
  }

  const raw = await apiGet<unknown[]>("/pc-inventory");
  return z.array(PCProductSchema).parse(raw);
}

export async function fetchPCProductById(
  id: string
): Promise<PCProduct | undefined> {
  const products = await fetchPCInventory();
  return products.find((p) => p.id === id);
}

export async function fetchPCProductsByLineup(
  lineup: PCLineup
): Promise<PCProduct[]> {
  const products = await fetchPCInventory();
  return products.filter((p) => p.lineup === lineup);
}
