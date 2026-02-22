import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

// ============================================================================
// TYPE DEFINITIONS (Mirror Python models)
// ============================================================================

export const SocialPlatformSchema = z.enum([
    "tiktok",
    "instagram",
    "twitter",
    "linkedin",
    "youtube-shorts",
    "facebook",
]);
export type SocialPlatform = z.infer<typeof SocialPlatformSchema>;

export const ContentToneSchema = z.enum([
    "aggressive",
    "casual",
    "professional",
    "viral",
    "emotional",
]);
export type ContentTone = z.infer<typeof ContentToneSchema>;

export const SocialPostSchema = z.object({
    platform: SocialPlatformSchema,
    title: z.string(),
    body: z.string(),
    hashtags: z.array(z.string()),
    emojis: z.array(z.string()),
    cta: z.string().optional(),
    tone: ContentToneSchema,
    trendingTopic: z.string().optional(),
    gpuMention: z.string().optional(),
    createdAt: z.string().datetime(),
});
export type SocialPost = z.infer<typeof SocialPostSchema>;

export const TrendingTopicSchema = z.object({
    keyword: z.string(),
    category: z.string(),
    platforms: z.array(z.string()),
    volume: z.number(),
    urgency: z.number(),
    relevance: z.number(),
});
export type TrendingTopic = z.infer<typeof TrendingTopicSchema>;

export const SocialPostsResponseSchema = z.object({
    posts: z.array(SocialPostSchema),
    trendingTopics: z.array(TrendingTopicSchema),
    productContext: z.string().optional(),
    modelUsed: z.string(),
    generationTimeMs: z.number(),
});
export type SocialPostsResponse = z.infer<typeof SocialPostsResponseSchema>;

// ============================================================================
// API CLIENT
// ============================================================================

export class SocialPostsClient {
    private baseUrl: string;

    constructor(baseUrl: string = "/api") {
        this.baseUrl = baseUrl;
    }

    /**
     * Generate trending social media posts.
     *
     * @param platforms - Social platforms to generate for
     * @param numTopics - Number of trending topics to cover
     * @param tones - Content tones/styles to generate
     * @returns Generated posts and metadata
     */
    async generatePosts(options: {
        platforms?: SocialPlatform[];
        numTopics?: number;
        tones?: ContentTone[];
    } = {}): Promise<SocialPostsResponse> {
        const requestBody = {
            platforms: options.platforms || ["tiktok", "instagram", "twitter"],
            numTopics: options.numTopics || 2,
            tones: options.tones || ["casual", "viral"],
        };

        const response = await fetch(`${this.baseUrl}/social-posts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error(
                `API error: ${response.status} ${response.statusText}`
            );
        }

        const json = await response.json();
        return SocialPostsResponseSchema.parse(json);
    }

    /**
     * Get trending topics without generating posts.
     *
     * @returns List of trending topics and platform info
     */
    async getTrendingTopics() {
        const response = await fetch(`${this.baseUrl}/social-posts`, {
            method: "GET",
        });

        if (!response.ok) {
            throw new Error(
                `API error: ${response.status} ${response.statusText}`
            );
        }

        return response.json();
    }
}

// ============================================================================
// REACT HOOKS
// ============================================================================

/**
 * Hook to generate social posts with caching and error handling.
 *
 * Usage:
 * ```tsx
 * const { data, isLoading, error } = useSocialPostsGenerator({
 *   platforms: ["tiktok", "instagram"],
 *   numTopics: 3,
 *   enabled: true, // auto-fetch on mount
 * });
 * ```
 */
export function useSocialPostsGenerator(options?: {
    platforms?: SocialPlatform[];
    numTopics?: number;
    tones?: ContentTone[];
    enabled?: boolean;
}) {
    const client = new SocialPostsClient();

    return useQuery({
        queryKey: [
            "socialPosts",
            options?.platforms || ["tiktok", "instagram", "twitter"],
            options?.numTopics || 2,
            options?.tones || ["casual", "viral"],
        ],
        queryFn: async () => {
            return client.generatePosts({
                platforms: options?.platforms,
                numTopics: options?.numTopics,
                tones: options?.tones,
            });
        },
        enabled: options?.enabled ?? false, // default: manual trigger only
        staleTime: 1000 * 60 * 10, // 10 minutes
        retry: 1,
    });
}

/**
 * Hook to fetch available trending topics.
 * Useful for showing what's trending without generating posts.
 */
export function useTrendingTopics() {
    const client = new SocialPostsClient();

    return useQuery({
        queryKey: ["trendingTopics"],
        queryFn: () => client.getTrendingTopics(),
        staleTime: 1000 * 60 * 30, // 30 minutes
        retry: 1,
    });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getPlatformEmoji(platform: SocialPlatform): string {
    const emojiMap: Record<SocialPlatform, string> = {
        tiktok: "🎵",
        instagram: "📸",
        twitter: "𝕏",
        linkedin: "💼",
        "youtube-shorts": "▶️",
        facebook: "👍",
    };
    return emojiMap[platform] || "📱";
}

export function getToneColor(tone: ContentTone): string {
    const colorMap: Record<ContentTone, string> = {
        aggressive: "bg-red-100 text-red-800",
        casual: "bg-blue-100 text-blue-800",
        professional: "bg-slate-100 text-slate-800",
        viral: "bg-purple-100 text-purple-800",
        emotional: "bg-pink-100 text-pink-800",
    };
    return colorMap[tone] || "bg-gray-100 text-gray-800";
}

/**
 * Format a social post for display with line breaks and emoji rendering.
 */
export function formatPostBody(post: SocialPost): string {
    return `${post.body}\n\n${post.hashtags.join(" ")}${post.cta ? `\n\n▶️ ${post.cta}` : ""
        }`;
}

/**
 * Copy post text to clipboard (for social media sharing).
 */
export async function copyPostToClipboard(
    post: SocialPost
): Promise<boolean> {
    try {
        const text = formatPostBody(post);
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}
