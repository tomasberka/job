import { PC_INVENTORY_MOCK } from "./pc-inventory-mock";
import { PCProductSchema, type PCProduct, type PCLineup, type CreatePCProduct } from "../types/pc-product";
import { apiGet, apiPost, isMockMode } from "@/lib/api-client";
import { z } from "zod";

export async function fetchPCInventory(): Promise<PCProduct[]> {
  if (isMockMode()) {
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

export async function createPCProduct(data: CreatePCProduct): Promise<PCProduct> {
  if (isMockMode()) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const now = new Date().toISOString();
    const newProduct: PCProduct = {
      id: `hc-${Date.now()}`,
      ...data,
      currency: "CZK",
      imageUrl: data.imageUrl || undefined,
      createdAt: now,
      updatedAt: now,
    };
    PC_INVENTORY_MOCK.push(newProduct);
    return newProduct;
  }

  const raw = await apiPost<unknown>("/pc-inventory", data);
  return PCProductSchema.parse(raw);
}
