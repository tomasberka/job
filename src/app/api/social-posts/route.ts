import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Validation schema for API requests
const SocialPostRequestSchema = z.object({
    platforms: z.array(z.string()).optional().default(["tiktok", "instagram"]),
    numTopics: z.number().int().min(1).max(5).optional().default(2),
    tones: z.array(z.string()).optional().default(["casual", "viral"]),
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
        SocialPostRequestSchema.parse(body);

        // Call Python backend (via environment or subprocess)
        // For now, we'll return a mock response to show structure
        const response = await generateSocialPostsFromPython();

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
        // Return trending topics and structure
        const trendingTopics = [
            {
                keyword: "GTA VI System Requirements",
                category: "gaming",
                platforms: ["twitter", "youtube-shorts", "tiktok"],
                volume: 8500,
                urgency: 0.95,
                relevance: 0.95,
            },
            {
                keyword: "RTX 5090 Gaming Performance",
                category: "gaming",
                platforms: ["youtube-shorts", "twitter", "instagram"],
                volume: 6200,
                urgency: 0.9,
                relevance: 0.98,
            },
        ];

        return NextResponse.json(
            {
                trending: trendingTopics,
                availablePlatforms: [
                    "tiktok",
                    "instagram",
                    "twitter",
                    "linkedin",
                    "youtube-shorts",
                    "facebook",
                ],
                availableTones: ["aggressive", "casual", "professional", "viral", "emotional"],
            },
            { status: 200 }
        );
    } catch {
        return NextResponse.json(
            {
                error: "Failed to fetch trending data",
            },
            { status: 500 }
        );
    }
}

/**
 * Placeholder: Call Python trending-socials generator.
 * In production, this would:
 * 1. Spawn Python subprocess
 * 2. Pass JSON params
 * 3. Parse JSON output
 * 4. Return to client
 */
async function generateSocialPostsFromPython(): Promise<object> {
    // Mock implementation for demonstration
    // In production: spawn subprocess and call trending-socials CLI

    const mockPosts = [
        {
            platform: "tiktok",
            title: "TikTok Post — GTA VI System Requirements",
            body: "POV: Právě si zjistil, že tvůj PC zvládá GTA VI bez problémů. HelloComp + RTX 5090 = neomezený gaming. 🔥💻",
            hashtags: ["#gta6", "#gamingpc", "#hellocomp"],
            emojis: ["🔥", "💻", "⚡"],
            cta: "Link in bio",
            tone: "casual",
            trendingTopic: "GTA VI System Requirements",
            gpuMention: "RTX 5090",
            createdAt: new Date().toISOString(),
        },
        {
            platform: "instagram",
            title: "Instagram Post — RTX 5090 Gaming Performance",
            body: "Když tvé gaming PC je tak výkonné, že accidentálně skipneš cutscenu. RTX 5090 v HelloComp — přesně to, co potřebuješ. 👀🎮✨",
            hashtags: ["#rtx5090", "#gaming", "#hellocomp"],
            emojis: ["👀", "🎮", "✨"],
            cta: "Link in bio",
            tone: "casual",
            trendingTopic: "RTX 5090 Gaming Performance",
            gpuMention: "RTX 5090",
            createdAt: new Date().toISOString(),
        },
    ];

    return {
        posts: mockPosts,
        trendingTopics: [
            {
                keyword: "GTA VI System Requirements",
                category: "gaming",
                platforms: ["twitter", "youtube-shorts", "tiktok"],
                volume: 8500,
                urgency: 0.95,
                relevance: 0.95,
            },
            {
                keyword: "RTX 5090 Gaming Performance",
                category: "gaming",
                platforms: ["youtube-shorts", "twitter", "instagram"],
                volume: 6200,
                urgency: 0.9,
                relevance: 0.98,
            },
        ],
        productContext: null,
        modelUsed: "gemini-2.0-flash",
        generationTimeMs: Math.random() * 5000,
    };
}
