import { VIDEO_WORKFLOW_MOCK } from "./video-workflow-mock";
import type { VideoExport } from "../types/video-export";

export async function fetchVideoExports(): Promise<VideoExport[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return VIDEO_WORKFLOW_MOCK;
}

export async function fetchVideoExportById(
  id: string
): Promise<VideoExport | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return VIDEO_WORKFLOW_MOCK.find((v) => v.id === id);
}
