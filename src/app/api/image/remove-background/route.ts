import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import {
    AdobeBgRemovalError,
    removeBackgroundWithAdobe,
} from "@/features/content-generator/services/adobe-bg-removal-service";

const RemoveBackgroundRequestSchema = z.object({
    imageUrl: z.string().url(),
    outputFormat: z.enum(["png", "jpeg", "webp"]).optional(),
});

type RateLimitEntry = {
    count: number;
    resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

function parseRateLimitNumber(raw: string | undefined, fallback: number): number {
    if (!raw) return fallback;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
    return Math.floor(parsed);
}

function getClientIp(request: NextRequest): string {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }
    return request.headers.get("x-real-ip") || "unknown";
}

function enforceRateLimit(clientId: string): { allowed: boolean; retryAfterSec: number } {
    const windowSec = parseRateLimitNumber(process.env.ADOBE_BG_REMOVE_RATE_LIMIT_WINDOW_SEC, 60);
    const maxRequests = parseRateLimitNumber(process.env.ADOBE_BG_REMOVE_RATE_LIMIT_MAX, 30);
    const now = Date.now();

    const entry = rateLimitStore.get(clientId);
    if (!entry || now > entry.resetAt) {
        rateLimitStore.set(clientId, {
            count: 1,
            resetAt: now + windowSec * 1000,
        });
        return { allowed: true, retryAfterSec: windowSec };
    }

    if (entry.count >= maxRequests) {
        const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
        return { allowed: false, retryAfterSec };
    }

    entry.count += 1;
    return { allowed: true, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
}

export async function GET() {
    const enabled = process.env.ADOBE_BG_REMOVE_ENABLED === "true";
    const configured = Boolean(process.env.ADOBE_API_KEY) && Boolean(process.env.ADOBE_BG_REMOVE_API_URL);
    const allowedHosts = process.env.ADOBE_BG_REMOVE_ALLOWED_HOSTS || "";

    return NextResponse.json({
        provider: "adobe",
        enabled,
        configured,
        mode: "server-proxy",
        allowedHosts,
    });
}

export async function POST(request: NextRequest) {
    const requestId = randomUUID();
    const clientIp = getClientIp(request);
    const rateCheck = enforceRateLimit(clientIp);

    if (!rateCheck.allowed) {
        console.warn(
            `[Adobe BG] rate-limited ip=${clientIp} requestId=${requestId} retryAfter=${rateCheck.retryAfterSec}s`,
        );
        return NextResponse.json(
            {
                error: "Rate limit exceeded",
                message: "Too many background removal requests. Please retry later.",
            },
            {
                status: 429,
                headers: {
                    "Retry-After": String(rateCheck.retryAfterSec),
                },
            },
        );
    }

    try {
        const body = await request.json();
        const payload = RemoveBackgroundRequestSchema.parse(body);
        const imageHost = new URL(payload.imageUrl).host;

        console.info(`[Adobe BG] start requestId=${requestId} ip=${clientIp} host=${imageHost}`);
        const result = await removeBackgroundWithAdobe(payload);

        console.info(`[Adobe BG] success requestId=${requestId} ip=${clientIp}`);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.warn(`[Adobe BG] validation error requestId=${requestId} ip=${clientIp}`);
            return NextResponse.json(
                {
                    error: "Validation error",
                    details: error.errors,
                },
                { status: 400 },
            );
        }

        if (error instanceof AdobeBgRemovalError) {
            console.warn(`[Adobe BG] adobe error requestId=${requestId} ip=${clientIp} status=${error.status}`);
            return NextResponse.json(
                {
                    error: "Adobe background removal failed",
                    message: error.message,
                },
                { status: error.status },
            );
        }

        console.error(`[Adobe BG] unknown error requestId=${requestId} ip=${clientIp}`);
        return NextResponse.json(
            {
                error: "Internal server error",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}
