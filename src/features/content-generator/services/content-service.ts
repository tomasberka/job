import { CONTENT_MOCK } from "./content-mock";
import { ContentItemSchema, type ContentItem, type ContentType } from "../types/content-item";
import { apiGet, useMocks } from "@/lib/api-client";
import { z } from "zod";

export async function fetchContentItems(): Promise<ContentItem[]> {
  if (useMocks()) {
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
