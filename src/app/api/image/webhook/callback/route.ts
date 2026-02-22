import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import {
    validateWebhookSecret,
    completeJob,
    failJob,
    getJob,
} from "@/features/content-generator/services/adobe-webhook-service";

// ─── Schema for Adobe callback payload ──────────────────────
// Adobe may send different shapes depending on the API product.
// We accept a flexible schema and extract what we need.

const AdobeCallbackSchema = z.object({
    jobId: z.string().uuid().optional(),
    status: z.enum(["success", "succeeded", "completed", "failed", "error"]).optional(),
    output: z
        .object({
            href: z.string().url().optional(),
            url: z.string().url().optional(),
            image: z.string().optional(),
        })
        .optional(),
    error: z
        .object({
            message: z.string().optional(),
            code: z.string().optional(),
        })
        .optional(),
    _links: z
        .object({
            self: z.object({ href: z.string().url().optional() }).optional(),
        })
        .optional(),
});

const WEBHOOK_SECRET_HEADER = "x-webhook-secret";

export async function POST(request: NextRequest) {
    const requestId = randomUUID();
    const jobIdParam = request.nextUrl.searchParams.get("jobId");

    // ── 1. Validate shared secret ──────────────────────────
    const secretHeader = request.headers.get(WEBHOOK_SECRET_HEADER);
    if (!validateWebhookSecret(secretHeader)) {
        console.warn(
            `[Webhook CB] REJECTED unauthorized callback requestId=${requestId} jobId=${jobIdParam ?? "none"}`,
        );
        return NextResponse.json(
            { error: "Unauthorized", message: "Invalid or missing webhook secret." },
            { status: 401 },
        );
    }

    // ── 2. Parse body ──────────────────────────────────────
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        console.warn(`[Webhook CB] invalid JSON requestId=${requestId}`);
        return NextResponse.json(
            { error: "Bad request", message: "Invalid JSON body." },
            { status: 400 },
        );
    }

    const parsed = AdobeCallbackSchema.safeParse(body);
    if (!parsed.success) {
        console.warn(
            `[Webhook CB] validation failed requestId=${requestId} errors=${JSON.stringify(parsed.error.errors)}`,
        );
        return NextResponse.json(
            { error: "Validation error", details: parsed.error.errors },
            { status: 400 },
        );
    }

    // ── 3. Resolve the jobId ───────────────────────────────
    // Prefer query param, fall back to body.jobId.
    const resolvedJobId = jobIdParam ?? parsed.data.jobId;
    if (!resolvedJobId) {
        console.warn(`[Webhook CB] missing jobId requestId=${requestId}`);
        return NextResponse.json(
            { error: "Bad request", message: "jobId is required (query param or body field)." },
            { status: 400 },
        );
    }

    const existingJob = getJob(resolvedJobId);
    if (!existingJob) {
        console.warn(`[Webhook CB] job not found requestId=${requestId} jobId=${resolvedJobId}`);
        return NextResponse.json(
            { error: "Not found", message: `Job ${resolvedJobId} does not exist.` },
            { status: 404 },
        );
    }

    // ── 4. Determine success vs failure ────────────────────
    const adobeStatus = parsed.data.status?.toLowerCase();
    const isSuccess = adobeStatus === "success" || adobeStatus === "succeeded" || adobeStatus === "completed";
    const isFailure = adobeStatus === "failed" || adobeStatus === "error";

    if (isFailure) {
        const errorMessage =
            parsed.data.error?.message ?? parsed.data.error?.code ?? "Adobe reported a processing failure.";
        failJob(resolvedJobId, errorMessage);
        console.info(
            `[Webhook CB] job FAILED requestId=${requestId} jobId=${resolvedJobId} error="${errorMessage}"`,
        );
        return NextResponse.json({ received: true, jobId: resolvedJobId, status: "failed" }, { status: 200 });
    }

    if (isSuccess || !adobeStatus) {
        // Extract output image URL from Adobe response.
        const outputImageUrl =
            parsed.data.output?.href ?? parsed.data.output?.url ?? parsed.data._links?.self?.href;

        completeJob(resolvedJobId, {
            outputImageUrl: outputImageUrl ?? undefined,
            outputImageDataUrl: parsed.data.output?.image,
            mimeType: outputImageUrl ? "image/png" : undefined,
        });

        console.info(
            `[Webhook CB] job COMPLETED requestId=${requestId} jobId=${resolvedJobId} hasUrl=${Boolean(outputImageUrl)}`,
        );
        return NextResponse.json({ received: true, jobId: resolvedJobId, status: "completed" }, { status: 200 });
    }

    // Unknown status — still acknowledge to prevent retries.
    console.warn(
        `[Webhook CB] unknown status="${adobeStatus}" requestId=${requestId} jobId=${resolvedJobId}`,
    );
    return NextResponse.json(
        { received: true, jobId: resolvedJobId, status: "unknown", adobeStatus },
        { status: 200 },
    );
}
