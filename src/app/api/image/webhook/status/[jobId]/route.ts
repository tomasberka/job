import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/features/content-generator/services/adobe-webhook-service";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ jobId: string }> },
) {
    const { jobId } = await params;

    if (!jobId || jobId.length < 10) {
        return NextResponse.json(
            { error: "Bad request", message: "Invalid jobId." },
            { status: 400 },
        );
    }

    const job = getJob(jobId);
    if (!job) {
        return NextResponse.json(
            { error: "Not found", message: `Job ${jobId} does not exist or has expired.` },
            { status: 404 },
        );
    }

    // Don't leak the full image data URL in status check — it can be huge.
    const safeJob = {
        id: job.id,
        imageUrl: job.imageUrl,
        status: job.status,
        outputImageUrl: job.outputImageUrl,
        hasOutputData: Boolean(job.outputImageDataUrl),
        mimeType: job.mimeType,
        error: job.error,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        completedAt: job.completedAt,
    };

    return NextResponse.json(safeJob, { status: 200 });
}
