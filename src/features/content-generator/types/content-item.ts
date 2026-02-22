import { z } from "zod";

export const ContentTypeSchema = z.enum([
  "tiktok-hook",
  "seo-meta",
  "video-script",
  "product-description",
  "social-post",
]);
export type ContentType = z.infer<typeof ContentTypeSchema>;

export const ContentStatusSchema = z.enum([
  "draft",
  "review",
  "approved",
  "published",
]);
export type ContentStatus = z.infer<typeof ContentStatusSchema>;

export const ContentItemSchema = z.object({
  id: z.string(),
  type: ContentTypeSchema,
  productSku: z.string(),
  title: z.string(),
  body: z.string(),
  status: ContentStatusSchema,
  tags: z.array(z.string()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type ContentItem = z.infer<typeof ContentItemSchema>;
