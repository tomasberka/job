import { NextResponse } from "next/server";
import { listJobs } from "@/features/content-generator/services/adobe-webhook-service";

/**
 * GET /api/image/webhook/jobs
 * List recent webhook jobs with their statuses.
 */
export async function GET() {
    const jobs = listJobs(50).map((job) => ({
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
    }));

    return NextResponse.json({ count: jobs.length, jobs }, { status: 200 });
}
