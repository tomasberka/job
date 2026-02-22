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
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type VideoExport = z.infer<typeof VideoExportSchema>;
