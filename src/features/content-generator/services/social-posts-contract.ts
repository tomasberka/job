import { z } from "zod";

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

export const TrendingTopicSchema = z.object({
    keyword: z.string(),
    category: z.string(),
    platforms: z.array(SocialPlatformSchema),
    volume: z.number(),
    urgency: z.number(),
    relevance: z.number(),
});
export type TrendingTopic = z.infer<typeof TrendingTopicSchema>;

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

export const SocialAutomationSchema = z.object({
    workflowStage: z.enum(["draft", "review", "scheduled", "published"]),
    pipeline: z.array(z.string()),
    publishTargets: z.array(SocialPlatformSchema),
    readyForScheduling: z.boolean(),
});
export type SocialAutomation = z.infer<typeof SocialAutomationSchema>;

export const SocialPostRequestSchema = z.object({
    platforms: z.array(SocialPlatformSchema).optional().default(["tiktok", "instagram"]),
    numTopics: z.number().int().min(1).max(5).optional().default(2),
    tones: z.array(ContentToneSchema).optional().default(["casual", "viral"]),
});
export type SocialPostRequest = z.infer<typeof SocialPostRequestSchema>;

export const SocialPostsResponseSchema = z.object({
    posts: z.array(SocialPostSchema),
    trendingTopics: z.array(TrendingTopicSchema),
    productContext: z.string().nullable().optional(),
    modelUsed: z.string(),
    generationTimeMs: z.number(),
    automation: SocialAutomationSchema,
});
export type SocialPostsResponse = z.infer<typeof SocialPostsResponseSchema>;

export const SocialPostsCatalogResponseSchema = z.object({
    trending: z.array(TrendingTopicSchema),
    availablePlatforms: z.array(SocialPlatformSchema),
    availableTones: z.array(ContentToneSchema),
    automationDefaults: SocialAutomationSchema,
});
export type SocialPostsCatalogResponse = z.infer<typeof SocialPostsCatalogResponseSchema>;

export const SocialProviderSchema = z.enum(["meta-suite", "multi-platform"]);
export type SocialProvider = z.infer<typeof SocialProviderSchema>;

export const SocialPublishJobInputSchema = z.object({
    assetName: z.string(),
    assetSizeBytes: z.number().int().nonnegative(),
    assetType: z.enum(["video", "image"]),
    platforms: z.array(SocialPlatformSchema).min(1),
    caption: z.string().min(1),
    scheduledAt: z.string().datetime().optional(),
});
export type SocialPublishJobInput = z.infer<typeof SocialPublishJobInputSchema>;

export const SocialPublishRequestSchema = z.object({
    provider: SocialProviderSchema.default("meta-suite"),
    jobs: z.array(SocialPublishJobInputSchema).min(1),
});
export type SocialPublishRequest = z.infer<typeof SocialPublishRequestSchema>;

export const SocialPublishJobSchema = z.object({
    id: z.string(),
    status: z.enum(["queued", "processing", "scheduled", "published", "failed"]),
    provider: SocialProviderSchema,
    platforms: z.array(SocialPlatformSchema),
    assetName: z.string(),
    captionPreview: z.string(),
    scheduledAt: z.string().datetime().optional(),
    createdAt: z.string().datetime(),
});
export type SocialPublishJob = z.infer<typeof SocialPublishJobSchema>;

export const SocialPublishResponseSchema = z.object({
    batchId: z.string(),
    jobs: z.array(SocialPublishJobSchema),
    summary: z.object({
        total: z.number().int().nonnegative(),
        queued: z.number().int().nonnegative(),
        provider: SocialProviderSchema,
    }),
    nextSteps: z.array(z.string()),
});
export type SocialPublishResponse = z.infer<typeof SocialPublishResponseSchema>;
