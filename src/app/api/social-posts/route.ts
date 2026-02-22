import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
    ContentToneSchema,
    SocialPlatformSchema,
    SocialPostRequestSchema,
} from "@/features/content-generator/services/social-posts-contract";
import {
    generateMockSocialPosts,
    getDefaultAutomation,
    getMockTrendingTopics,
} from "@/features/content-generator/services/social-posts-mock-generator";

const SocialCatalogSchema = z.object({
    trending: z.array(
        z.object({
            keyword: z.string(),
            category: z.string(),
            platforms: z.array(SocialPlatformSchema),
            volume: z.number(),
            urgency: z.number(),
            relevance: z.number(),
        })
    ),
    availablePlatforms: z.array(SocialPlatformSchema),
    availableTones: z.array(ContentToneSchema),
    automationDefaults: z.object({
        workflowStage: z.enum(["draft", "review", "scheduled", "published"]),
        pipeline: z.array(z.string()),
        publishTargets: z.array(SocialPlatformSchema),
        readyForScheduling: z.boolean(),
    }),
});

/**
 * POST /api/social-posts
 *
 * Generate trending social media posts using AI.
 * Falls back to template-based posts if GEMINI_API_KEY is not set.
 *
 * Request body:
 * {
 *   "platforms": ["tiktok", "instagram", "twitter"],
 *   "numTopics": 2,
 *   "tones": ["casual", "viral"]
 * }
 *
 * Response:
 * {
 *   "posts": [...],
 *   "trendingTopics": [...],
 *   "modelUsed": "gemini-2.0-flash",
 *   "generationTimeMs": 1234
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = SocialPostRequestSchema.parse(body);

        const response = generateMockSocialPosts({
            platforms: parsed.platforms,
            numTopics: parsed.numTopics,
            tones: parsed.tones,
        });

        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: "Validation error",
                    details: error.errors,
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                error: "Internal server error",
                message:
                    error instanceof Error
                        ? error.message
                        : "Unknown error occurred",
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/social-posts
 *
 * Retrieve trending topics and example posts (no generation).
 */
export async function GET() {
    try {
        const payload = {
            trending: getMockTrendingTopics(),
            availablePlatforms: [
                "tiktok",
                "instagram",
                "twitter",
                "linkedin",
                "youtube-shorts",
                "facebook",
            ] as const,
            availableTones: ["aggressive", "casual", "professional", "viral", "emotional"] as const,
            automationDefaults: getDefaultAutomation(["tiktok", "instagram", "twitter"]),
        };

        const validated = SocialCatalogSchema.parse(payload);
        return NextResponse.json(validated, { status: 200 });
    } catch {
        return NextResponse.json(
            {
                error: "Failed to fetch trending data",
            },
            { status: 500 }
        );
    }
}
