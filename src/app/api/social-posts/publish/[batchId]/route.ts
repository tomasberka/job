import { NextRequest, NextResponse } from "next/server";
import { SocialPublishBatchStatusResponseSchema } from "@/features/content-generator/services/social-posts-contract";
import { resolveBatchStatus } from "@/lib/social-publish-store";

type RouteContext = {
  params: Promise<{ batchId: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { batchId } = await context.params;
    const status = await resolveBatchStatus(batchId);

    if (!status) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    const response = SocialPublishBatchStatusResponseSchema.parse(status);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to resolve batch status",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
