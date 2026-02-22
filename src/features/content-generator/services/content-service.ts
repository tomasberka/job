import { CONTENT_MOCK } from "./content-mock";
import { ContentItemSchema, type ContentItem, type ContentType, type CreateContentItem } from "../types/content-item";
import { apiGet, apiPost, isMockMode } from "@/lib/api-client";
import { z } from "zod";

export async function fetchContentItems(): Promise<ContentItem[]> {
  if (isMockMode()) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return CONTENT_MOCK;
  }

  const raw = await apiGet<unknown[]>("/content-items");
  return z.array(ContentItemSchema).parse(raw);
}

export async function fetchContentByType(
  type: ContentType
): Promise<ContentItem[]> {
  const items = await fetchContentItems();
  return items.filter((c) => c.type === type);
}

export async function createContentItem(data: CreateContentItem): Promise<ContentItem> {
  if (isMockMode()) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const now = new Date().toISOString();
    const newItem: ContentItem = {
      id: `cg-${Date.now()}`,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    CONTENT_MOCK.push(newItem);
    return newItem;
  }

  const raw = await apiPost<unknown>("/content-items", data);
  return ContentItemSchema.parse(raw);
}
