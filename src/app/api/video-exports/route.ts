import { NextResponse, NextRequest } from "next/server";
import { VIDEO_WORKFLOW_MOCK } from "@/features/video-workflow/services/video-workflow-mock";
import { CreateVideoExportSchema } from "@/features/video-workflow/types/video-export";

export async function GET() {
  return NextResponse.json(VIDEO_WORKFLOW_MOCK);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = CreateVideoExportSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const newExport = {
    id: `vw-${Date.now()}`,
    ...parsed.data,
    status: "queued" as const,
    progress: 0,
    createdAt: now,
    updatedAt: now,
  };

  VIDEO_WORKFLOW_MOCK.push(newExport);
  return NextResponse.json(newExport, { status: 201 });
}
