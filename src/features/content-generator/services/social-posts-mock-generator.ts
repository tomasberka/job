import {
    type ContentTone,
    type SocialAutomation,
    type SocialPlatform,
    type SocialPost,
    type SocialPostsResponse,
    type TrendingTopic,
} from "./social-posts-contract";

const TRENDING_TOPICS: TrendingTopic[] = [
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
    {
        keyword: "Best 1440p Gaming Builds",
        category: "hardware",
        platforms: ["instagram", "facebook", "linkedin"],
        volume: 4100,
        urgency: 0.74,
        relevance: 0.88,
    },
];

const PLATFORM_CTAS: Record<SocialPlatform, string> = {
    tiktok: "Link in bio",
    instagram: "Link in bio",
    twitter: "Více na webu",
    linkedin: "Zjistit více",
    "youtube-shorts": "Full specs na webu",
    facebook: "Mrkni na nabídku",
};

function composeBody(platform: SocialPlatform, topic: string, tone: ContentTone): string {
    const tonePrefix: Record<ContentTone, string> = {
        aggressive: "Nečekej.",
        casual: "POV:",
        professional: "Výkon bez kompromisů.",
        viral: "Tohle právě trenduje:",
        emotional: "Když chceš, aby gaming konečně dával smysl.",
    };

    return `${tonePrefix[tone]} ${topic}. HelloComp sestavy s RTX třídou výkonu drží FPS stabilně i při náročných scénách.`;
}

function createPost(platform: SocialPlatform, topic: TrendingTopic, tone: ContentTone): SocialPost {
    return {
        platform,
        title: `${platform.toUpperCase()} — ${topic.keyword}`,
        body: composeBody(platform, topic.keyword, tone),
        hashtags: ["#hellocomp", "#gamingpc", `#${topic.keyword.split(" ")[0].toLowerCase()}`],
        emojis: ["🔥", "🎮", "⚡"],
        cta: PLATFORM_CTAS[platform],
        tone,
        trendingTopic: topic.keyword,
        gpuMention: "RTX 5090",
        createdAt: new Date().toISOString(),
    };
}

export function getMockTrendingTopics() {
    return TRENDING_TOPICS;
}

export function getDefaultAutomation(platforms: SocialPlatform[]): SocialAutomation {
    return {
        workflowStage: "draft",
        pipeline: ["generate", "brand-check", "review", "schedule"],
        publishTargets: platforms,
        readyForScheduling: true,
    };
}

export function generateMockSocialPosts(options: {
    platforms: SocialPlatform[];
    numTopics: number;
    tones: ContentTone[];
}): SocialPostsResponse {
    const selectedTopics = TRENDING_TOPICS.slice(0, options.numTopics);
    const selectedTones: ContentTone[] = options.tones.length ? options.tones : ["casual"];

    const posts = options.platforms.flatMap((platform) =>
        selectedTopics.map((topic, index) =>
            createPost(platform, topic, selectedTones[index % selectedTones.length])
        )
    );

    return {
        posts,
        trendingTopics: selectedTopics,
        productContext: null,
        modelUsed: "gemini-2.0-flash",
        generationTimeMs: Math.round(600 + Math.random() * 1600),
        automation: getDefaultAutomation(options.platforms),
    };
}
