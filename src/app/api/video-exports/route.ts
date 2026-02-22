import { NextResponse } from "next/server";
import { VIDEO_WORKFLOW_MOCK } from "@/features/video-workflow/services/video-workflow-mock";

export async function GET() {
  return NextResponse.json(VIDEO_WORKFLOW_MOCK);
}
