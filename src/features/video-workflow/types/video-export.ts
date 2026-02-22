import { z } from "zod";

export const VideoExportStatusSchema = z.enum([
  "queued",
  "rendering",
  "exported",
  "uploading",
  "published",
  "failed",
]);
export type VideoExportStatus = z.infer<typeof VideoExportStatusSchema>;

export const VideoFormatSchema = z.enum([
  "H.264 MP4",
  "H.265 MP4",
  "ProRes 422",
  "DNxHD",
]);
export type VideoFormat = z.infer<typeof VideoFormatSchema>;

export const VideoExportSchema = z.object({
  id: z.string(),
  title: z.string(),
  productSku: z.string(),
  platform: z.enum(["youtube", "tiktok", "instagram", "internal"]),
  format: VideoFormatSchema,
  resolution: z.string(),
  duration: z.number().describe("Duration in seconds"),
  fileSize: z.number().describe("File size in MB"),
  status: VideoExportStatusSchema,
  progress: z.number().min(0).max(100),
  davinci: z.object({
    project: z.string(),
    timeline: z.string(),
    colorGrade: z.boolean(),
  }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type VideoExport = z.infer<typeof VideoExportSchema>;

export const VideoPlatformSchema = z.enum(["youtube", "tiktok", "instagram", "internal"]);
export type VideoPlatform = z.infer<typeof VideoPlatformSchema>;

export const CreateVideoExportSchema = z.object({
  title: z.string().min(1, "Název je povinný"),
  productSku: z.string().min(1, "SKU produktu je povinné"),
  platform: VideoPlatformSchema,
  format: VideoFormatSchema,
  resolution: z.string().min(1, "Rozlišení je povinné"),
  duration: z.number().nonnegative("Délka nesmí být záporná"),
  fileSize: z.number().nonnegative("Velikost nesmí být záporná"),
  davinci: z.object({
    project: z.string().min(1, "Název projektu je povinný"),
    timeline: z.string().min(1, "Časová osa je povinná"),
    colorGrade: z.boolean(),
  }),
});
export type CreateVideoExport = z.infer<typeof CreateVideoExportSchema>;
