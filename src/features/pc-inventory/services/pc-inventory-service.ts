import { PC_INVENTORY_MOCK } from "./pc-inventory-mock";
import type { PCProduct, PCLineup } from "../types/pc-product";

export async function fetchPCInventory(): Promise<PCProduct[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return PC_INVENTORY_MOCK;
}

export async function fetchPCProductById(
  id: string
): Promise<PCProduct | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return PC_INVENTORY_MOCK.find((p) => p.id === id);
}

export async function fetchPCProductsByLineup(
  lineup: PCLineup
): Promise<PCProduct[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return PC_INVENTORY_MOCK.filter((p) => p.lineup === lineup);
}
