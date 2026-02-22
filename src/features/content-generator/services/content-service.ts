import { CONTENT_MOCK } from "./content-mock";
import type { ContentItem, ContentType } from "../types/content-item";

export async function fetchContentItems(): Promise<ContentItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return CONTENT_MOCK;
}

export async function fetchContentByType(
  type: ContentType
): Promise<ContentItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return CONTENT_MOCK.filter((c) => c.type === type);
}
