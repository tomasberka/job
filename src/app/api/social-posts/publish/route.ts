import { NextRequest, NextResponse } from "next/server";
import {
    SocialPublishRequestSchema,
    SocialPublishResponseSchema,
} from "@/features/content-generator/services/social-posts-contract";

function createJobId(index: number) {
    return `job_${Date.now()}_${index + 1}`;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = SocialPublishRequestSchema.parse(body);

        const now = new Date().toISOString();

        const jobs = parsed.jobs.map((job, index) => ({
            id: createJobId(index),
            status: job.scheduledAt ? "scheduled" : "queued",
            provider: parsed.provider,
            platforms: job.platforms,
            assetName: job.assetName,
            captionPreview: job.caption.slice(0, 120),
            scheduledAt: job.scheduledAt,
            createdAt: now,
        }));

        const response = SocialPublishResponseSchema.parse({
            batchId: `batch_${Date.now()}`,
            jobs,
            summary: {
                total: jobs.length,
                queued: jobs.filter((job) => job.status === "queued").length,
                provider: parsed.provider,
            },
            nextSteps: [
                "Validate final media cuts (length/format)",
                "Push scheduled jobs to Meta Graph API adapter",
                "Track publish status webhook callbacks",
            ],
        });

        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            {
                error: "Failed to prepare publish batch",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 400 }
        );
    }
}
