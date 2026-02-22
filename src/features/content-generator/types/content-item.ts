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

export const CreateContentItemSchema = z.object({
  type: ContentTypeSchema,
  productSku: z.string().min(1, "SKU produktu je povinné"),
  title: z.string().min(1, "Název je povinný"),
  body: z.string().min(1, "Obsah je povinný"),
  status: ContentStatusSchema,
  tags: z.array(z.string()),
});
export type CreateContentItem = z.infer<typeof CreateContentItemSchema>;
