import { VIDEO_WORKFLOW_MOCK } from "./video-workflow-mock";
import { VideoExportSchema, type VideoExport } from "../types/video-export";
import { apiGet, useMocks } from "@/lib/api-client";
import { z } from "zod";

export async function fetchVideoExports(): Promise<VideoExport[]> {
  if (useMocks()) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return VIDEO_WORKFLOW_MOCK;
  }

  const raw = await apiGet<unknown[]>("/video-exports");
  return z.array(VideoExportSchema).parse(raw);
}

export async function fetchVideoExportById(
  id: string
): Promise<VideoExport | undefined> {
  const exports = await fetchVideoExports();
  return exports.find((v) => v.id === id);
}
