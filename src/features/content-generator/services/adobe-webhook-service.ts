import { randomUUID } from "crypto";

// ─── Job types ───────────────────────────────────────────────

export type JobStatus = "pending" | "processing" | "completed" | "failed";

export interface WebhookJob {
    id: string;
    imageUrl: string;
    status: JobStatus;
    outputImageUrl?: string;
    outputImageDataUrl?: string;
    mimeType?: string;
    error?: string;
    createdAt: number;
    updatedAt: number;
    completedAt?: number;
}

// ─── In-memory job store ─────────────────────────────────────

const jobStore = new Map<string, WebhookJob>();

/** Max age before stale jobs are evicted (default: 1 hour). */
const JOB_TTL_MS = 60 * 60 * 1000;

/** Maximum number of jobs kept in memory to prevent unbounded growth. */
const MAX_JOBS = 500;

// ─── Job CRUD ────────────────────────────────────────────────

/**
 * Create a new pending job for background removal.
 */
export function createJob(imageUrl: string): WebhookJob {
    evictStaleJobs();

    const now = Date.now();
    const job: WebhookJob = {
        id: randomUUID(),
        imageUrl,
        status: "pending",
        createdAt: now,
        updatedAt: now,
    };
    jobStore.set(job.id, job);
    return job;
}

/**
 * Transition job to "processing" once Adobe request is dispatched.
 */
export function markJobProcessing(jobId: string): WebhookJob | undefined {
    const job = jobStore.get(jobId);
    if (!job) return undefined;
    job.status = "processing";
    job.updatedAt = Date.now();
    return job;
}

/**
 * Complete a job with output data from Adobe callback.
 */
export function completeJob(
    jobId: string,
    result: {
        outputImageUrl?: string;
        outputImageDataUrl?: string;
        mimeType?: string;
    },
): WebhookJob | undefined {
    const job = jobStore.get(jobId);
    if (!job) return undefined;

    const now = Date.now();
    job.status = "completed";
    job.outputImageUrl = result.outputImageUrl;
    job.outputImageDataUrl = result.outputImageDataUrl;
    job.mimeType = result.mimeType;
    job.completedAt = now;
    job.updatedAt = now;
    return job;
}

/**
 * Mark a job as failed with an error message.
 */
export function failJob(jobId: string, error: string): WebhookJob | undefined {
    const job = jobStore.get(jobId);
    if (!job) return undefined;

    const now = Date.now();
    job.status = "failed";
    job.error = error;
    job.completedAt = now;
    job.updatedAt = now;
    return job;
}

/**
 * Retrieve a job by its ID.
 */
export function getJob(jobId: string): WebhookJob | undefined {
    return jobStore.get(jobId);
}

/**
 * List recent jobs (newest first), with optional limit.
 */
export function listJobs(limit = 50): WebhookJob[] {
    return Array.from(jobStore.values())
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit);
}

// ─── Shared secret validation ────────────────────────────────

/**
 * Validate the incoming webhook request carries the correct shared secret.
 * The header name defaults to `x-webhook-secret`.
 */
export function validateWebhookSecret(headerValue: string | null): boolean {
    const expectedSecret = process.env.ADOBE_WEBHOOK_SECRET;
    if (!expectedSecret || expectedSecret.trim().length === 0) {
        // If no secret is configured, reject ALL callbacks for safety.
        return false;
    }
    if (!headerValue || headerValue.trim().length === 0) {
        return false;
    }
    // Constant-time comparison to prevent timing attacks.
    return timingSafeEqual(expectedSecret, headerValue);
}

/**
 * Constant-time string comparison (prevents timing attacks).
 */
function timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
}

// ─── Build the callback URL that Adobe should call ───────────

/**
 * Returns the full callback URL to include in Adobe async requests.
 * Format: `{ADOBE_WEBHOOK_CALLBACK_URL}?jobId={jobId}`
 */
export function buildCallbackUrl(jobId: string): string | null {
    const baseUrl = process.env.ADOBE_WEBHOOK_CALLBACK_URL;
    if (!baseUrl || baseUrl.trim().length === 0) return null;

    const url = new URL(baseUrl);
    url.searchParams.set("jobId", jobId);
    return url.toString();
}

// ─── Housekeeping ────────────────────────────────────────────

function evictStaleJobs(): void {
    const now = Date.now();
    for (const [id, job] of jobStore) {
        if (now - job.createdAt > JOB_TTL_MS) {
            jobStore.delete(id);
        }
    }
    // If still over limit, evict oldest first.
    if (jobStore.size >= MAX_JOBS) {
        const sorted = Array.from(jobStore.entries()).sort(
            (a, b) => a[1].createdAt - b[1].createdAt,
        );
        const toDelete = sorted.slice(0, sorted.length - MAX_JOBS + 1);
        for (const [id] of toDelete) {
            jobStore.delete(id);
        }
    }
}
