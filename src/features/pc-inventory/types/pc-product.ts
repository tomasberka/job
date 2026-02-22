import { z } from "zod";

export const PCLineupSchema = z.enum(["GAMER SE", "GAMER Pro", "GAMER Max"]);
export type PCLineup = z.infer<typeof PCLineupSchema>;

export const PCStatusSchema = z.enum([
  "in-stock",
  "low-stock",
  "out-of-stock",
  "pre-order",
]);
export type PCStatus = z.infer<typeof PCStatusSchema>;

export const PCSpecsSchema = z.object({
  cpu: z.string(),
  gpu: z.string(),
  ram: z.string(),
  storage: z.string(),
  cooling: z.string(),
  psu: z.string(),
});
export type PCSpecs = z.infer<typeof PCSpecsSchema>;

export const PCProductSchema = z.object({
  id: z.string(),
  sku: z.string(),
  name: z.string(),
  lineup: PCLineupSchema,
  price: z.number(),
  currency: z.literal("CZK"),
  specs: PCSpecsSchema,
  status: PCStatusSchema,
  stock: z.number().int().nonnegative(),
  imageUrl: z.string().url().optional(),
  images: z.array(z.string().url()).optional(), // All product images for marketing
  flags: z.array(z.string()).optional(), // Promo flags: action, new, tip
  shortDescription: z.string().optional(), // Short text for ads
  tags: z.array(z.string()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type PCProduct = z.infer<typeof PCProductSchema>;
