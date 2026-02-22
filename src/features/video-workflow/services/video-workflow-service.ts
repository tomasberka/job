import { VIDEO_WORKFLOW_MOCK } from "./video-workflow-mock";
import { VideoExportSchema, type VideoExport, type CreateVideoExport } from "../types/video-export";
import { apiGet, apiPost, isMockMode } from "@/lib/api-client";
import { z } from "zod";

export async function fetchVideoExports(): Promise<VideoExport[]> {
  if (isMockMode()) {
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

export async function createVideoExport(data: CreateVideoExport): Promise<VideoExport> {
  if (isMockMode()) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const now = new Date().toISOString();
    const newExport: VideoExport = {
      id: `vw-${Date.now()}`,
      ...data,
      status: "queued",
      progress: 0,
      createdAt: now,
      updatedAt: now,
    };
    VIDEO_WORKFLOW_MOCK.push(newExport);
    return newExport;
  }

  const raw = await apiPost<unknown>("/video-exports", data);
  return VideoExportSchema.parse(raw);
}
